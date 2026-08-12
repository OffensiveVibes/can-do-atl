import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { isAllowedEditor, isPrimaryAdministrator, normalizeEmail } from "../cms";
import {
  acceptInviteForUser,
  approveAccessRequest,
  createOrRefreshAccessRequest,
  createEvent,
  createHeroSlide,
  createOrRefreshInvite,
  createSiteUpdate,
  createTeamMember,
  deleteEvent,
  deleteHeroSlide,
  deleteSiteUpdate,
  deleteTeamMember,
  denyAccessRequest,
  getAdminContent,
  getInviteForEmail,
  getPublicContent,
  listInvites,
  listAccessRequests,
  reorderTeamMembers,
  revokeInvite,
  upsertServiceCards,
  upsertSiteAppearance,
  updateEvent,
  updateHeroSlide,
  upsertImpactMetrics,
  upsertSiteText,
  updateSiteUpdate,
  updateTeamMember,
} from "../db";
import { IMPACT_METRIC_KEYS } from "../impact";
import { APPEARANCE_MODES, BUTTON_SHAPES, SERVICE_CARD_KEYS } from "../appearance";
import { editorProcedure, primaryAdministratorProcedure } from "../authorization";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { SITE_TEXT_KEYS } from "@shared/siteText";

const optionalText = z.string().trim().max(512).optional().transform((value) => value || undefined);
const editorEventInput = z.object({
  title: z.string().trim().min(2).max(160),
  campus: z.string().trim().min(2).max(160),
  details: z.string().trim().max(5000).optional().transform((value) => value || undefined),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  linkHref: optionalText,
  isPublished: z.boolean(),
});
const editorUpdateInput = z.object({
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().min(2).max(5000),
  linkLabel: z.string().trim().max(80).optional().transform((value) => value || undefined),
  linkHref: optionalText,
  status: z.enum(["draft", "published"]),
});
const editorSlideInput = z.object({
  eyebrow: z.string().trim().min(2).max(120),
  headline: z.string().trim().min(2).max(180),
  accent: z.string().trim().max(180).optional().transform((value) => value || undefined),
  body: z.string().trim().min(2).max(5000),
  imageUrl: z.string().trim().min(1).max(512),
  imageKey: z.string().trim().max(512).optional().transform((value) => value || undefined),
  imageAlt: z.string().trim().min(3).max(255),
  volunteerHref: optionalText,
  donateHref: optionalText,
  position: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
});
const impactMetricInput = z.object({
  metricKey: z.enum(IMPACT_METRIC_KEYS),
  value: z.number().int().min(0).max(1_000_000_000),
  label: z.string().trim().min(4).max(180),
  position: z.number().int().min(0).max(2),
});
const impactMetricsInput = z.object({
  metrics: z.array(impactMetricInput).length(3).superRefine((metrics, ctx) => {
    const keys = metrics.map((metric) => metric.metricKey);
    if (new Set(keys).size !== IMPACT_METRIC_KEYS.length || !IMPACT_METRIC_KEYS.every((key) => keys.includes(key))) {
      ctx.addIssue({ code: "custom", message: "Provide each public impact metric exactly once." });
    }
  }),
});
const optionalUrl = z.string().trim().url().max(512).optional().or(z.literal("")).transform((value) => value || undefined);
const colorInput = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a six-digit hex color.");
const managedImageUrl = z.string().trim().min(1).max(512).refine((value) => value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "Use an uploaded image or a secure image URL.");
const optionalImageUrl = managedImageUrl.optional().or(z.literal("")).transform((value) => value || undefined);
const editorTeamMemberInput = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(160),
  bio: z.string().trim().max(5000).optional().transform((value) => value || undefined),
  imageUrl: optionalImageUrl,
  imageKey: z.string().trim().max(512).optional().transform((value) => value || undefined),
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  websiteUrl: optionalUrl,
  position: z.number().int().min(0).max(999),
  isPublished: z.boolean(),
});
const appearanceInput = z.object({
  siteName: z.string().trim().min(2).max(80), tabTitle: z.string().trim().min(2).max(100), logoUrl: optionalImageUrl, logoKey: optionalText, logoAlt: z.string().trim().min(3).max(255), primaryColor: colorInput, accentColor: colorInput, highlightColor: colorInput, inkColor: colorInput, buttonShape: z.enum(BUTTON_SHAPES),
  pageMode: z.enum(APPEARANCE_MODES), pageColor: colorInput, pageGradientFrom: colorInput, pageGradientTo: colorInput, pageImageUrl: optionalImageUrl, pageImageKey: optionalText, pageImageBlur: z.number().int().min(0).max(24), pageOverlayOpacity: z.number().int().min(0).max(92),
  headerMode: z.enum(APPEARANCE_MODES), headerColor: colorInput, headerGradientFrom: colorInput, headerGradientTo: colorInput, headerImageUrl: optionalImageUrl, headerImageKey: optionalText, headerImageBlur: z.number().int().min(0).max(24), headerOverlayOpacity: z.number().int().min(0).max(92),
  footerMode: z.enum(APPEARANCE_MODES), footerColor: colorInput, footerGradientFrom: colorInput, footerGradientTo: colorInput, footerImageUrl: optionalImageUrl, footerImageKey: optionalText, footerImageBlur: z.number().int().min(0).max(24), footerOverlayOpacity: z.number().int().min(0).max(92),
});
const serviceCardInput = z.object({ cardKey: z.enum(SERVICE_CARD_KEYS), imageUrl: managedImageUrl, imageKey: optionalText, hoverImageUrl: managedImageUrl, hoverImageKey: optionalText, imageAlt: z.string().trim().min(3).max(255), position: z.number().int().min(0).max(2) });
const serviceCardsInput = z.object({ cards: z.array(serviceCardInput).length(3).superRefine((cards, ctx) => { const keys = cards.map((card) => card.cardKey); if (new Set(keys).size !== SERVICE_CARD_KEYS.length || !SERVICE_CARD_KEYS.every((key) => keys.includes(key))) ctx.addIssue({ code: "custom", message: "Provide each service card exactly once." }); }) });
const siteTextInput = z.object({ entries: z.array(z.object({ textKey: z.enum(SITE_TEXT_KEYS as [string, ...string[]]), value: z.string().trim().min(1).max(5_000) })).length(SITE_TEXT_KEYS.length).superRefine((entries, ctx) => {
  const keys = entries.map((entry) => entry.textKey);
  if (new Set(keys).size !== SITE_TEXT_KEYS.length || !SITE_TEXT_KEYS.every((key) => keys.includes(key))) ctx.addIssue({ code: "custom", message: "Provide every editable website text field exactly once." });
}) });
const profileOrderInput = z.object({ ids: z.array(z.number().int().positive()).min(1).max(200).superRefine((ids, ctx) => { if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Each team profile can only appear once." }); }) });
const accessRequestInput = z.object({ email: z.string().trim().email().max(320), note: z.string().trim().max(1_000).optional().transform((value) => value || undefined) });

function parseImageDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a PNG, JPEG, or WebP image." });
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.byteLength > 4_500_000) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Images must be smaller than 4.5 MB." });
  const extension = match[1] === "image/jpeg" ? "jpg" : match[1].replace("image/", "");
  return { bytes, contentType: match[1], extension };
}

export const contentRouter = router({
  public: publicProcedure.query(() => getPublicContent()),
  admin: editorProcedure.query(() => getAdminContent()),
  createUpdate: editorProcedure.input(editorUpdateInput).mutation(({ ctx, input }) => createSiteUpdate({ ...input, authorId: ctx.user.id })),
  updateUpdate: editorProcedure.input(z.object({ id: z.number().int().positive(), data: editorUpdateInput })).mutation(({ input }) => updateSiteUpdate(input.id, input.data)),
  deleteUpdate: editorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteSiteUpdate(input.id)),
  createEvent: editorProcedure.input(editorEventInput).mutation(({ ctx, input }) => createEvent({ ...input, createdBy: ctx.user.id })),
  updateEvent: editorProcedure.input(z.object({ id: z.number().int().positive(), data: editorEventInput })).mutation(({ input }) => updateEvent(input.id, input.data)),
  deleteEvent: editorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteEvent(input.id)),
  createSlide: editorProcedure.input(editorSlideInput).mutation(({ ctx, input }) => createHeroSlide({ ...input, createdBy: ctx.user.id })),
  updateSlide: editorProcedure.input(z.object({ id: z.number().int().positive(), data: editorSlideInput })).mutation(({ input }) => updateHeroSlide(input.id, input.data)),
  deleteSlide: editorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteHeroSlide(input.id)),
  updateImpactMetrics: editorProcedure.input(impactMetricsInput).mutation(({ ctx, input }) => upsertImpactMetrics(input.metrics, ctx.user.id)),
  createTeamMember: editorProcedure.input(editorTeamMemberInput).mutation(({ ctx, input }) => createTeamMember({ ...input, createdBy: ctx.user.id })),
  updateTeamMember: editorProcedure.input(z.object({ id: z.number().int().positive(), data: editorTeamMemberInput })).mutation(({ input }) => updateTeamMember(input.id, input.data)),
  deleteTeamMember: editorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteTeamMember(input.id)),
  reorderTeamMembers: editorProcedure.input(profileOrderInput).mutation(({ input }) => reorderTeamMembers(input.ids)),
  updateAppearance: editorProcedure.input(appearanceInput).mutation(({ ctx, input }) => upsertSiteAppearance(input, ctx.user.id)),
  updateSiteText: editorProcedure.input(siteTextInput).mutation(({ ctx, input }) => upsertSiteText(input.entries as Array<{ textKey: import("@shared/siteText").SiteTextKey; value: string }>, ctx.user.id)),
  updateServiceCards: editorProcedure.input(serviceCardsInput).mutation(({ ctx, input }) => upsertServiceCards(input.cards, ctx.user.id)),
  uploadHeroImage: editorProcedure.input(z.object({ dataUrl: z.string().max(6_300_000) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`hero-slides/${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
  uploadTeamImage: editorProcedure.input(z.object({ dataUrl: z.string().max(6_300_000) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`team-members/${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
  uploadAppearanceImage: editorProcedure.input(z.object({ dataUrl: z.string().max(6_300_000), surface: z.enum(["page", "header", "footer"]) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`appearance/${input.surface}-${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
  uploadBrandImage: editorProcedure.input(z.object({ dataUrl: z.string().max(6_300_000) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`branding/logo-${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
  uploadServiceCardImage: editorProcedure.input(z.object({ dataUrl: z.string().max(6_300_000), cardKey: z.enum(SERVICE_CARD_KEYS), state: z.enum(["default", "hover"]) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`service-cards/${input.cardKey}-${input.state}-${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
});

export const accessRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const primary = isPrimaryAdministrator(ctx.user.email);
    const canEdit = isAllowedEditor(ctx.user);
    const invite = ctx.user.email ? await getInviteForEmail(ctx.user.email) : undefined;
    return { canEdit, primary, inviteStatus: invite?.status ?? null };
  }),
  acceptInvitation: protectedProcedure.mutation(async ({ ctx }) => {
    if (isPrimaryAdministrator(ctx.user.email)) return { activated: true };
    if (!ctx.user.email) throw new TRPCError({ code: "FORBIDDEN", message: "A verified email address is required." });
    return { activated: await acceptInviteForUser(ctx.user.email, ctx.user.id) };
  }),
  listInvites: primaryAdministratorProcedure.query(() => listInvites()),
  invite: primaryAdministratorProcedure.input(z.object({ email: z.string().email().max(320) })).mutation(({ ctx, input }) => {
    const email = normalizeEmail(input.email);
    if (isPrimaryAdministrator(email)) throw new TRPCError({ code: "BAD_REQUEST", message: "The primary administrator already has access." });
    return createOrRefreshInvite(email, ctx.user.id);
  }),
  revoke: primaryAdministratorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => revokeInvite(input.id)),
  submitRequest: publicProcedure.input(accessRequestInput).mutation(async ({ input }) => {
    const email = normalizeEmail(input.email);
    if (isPrimaryAdministrator(email)) throw new TRPCError({ code: "BAD_REQUEST", message: "This is already the primary administrator email." });
    await createOrRefreshAccessRequest(email, input.note);
    return { submitted: true };
  }),
  listRequests: editorProcedure.query(() => listAccessRequests()),
  approveRequest: editorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => approveAccessRequest(input.id, ctx.user.id)),
  denyRequest: editorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => denyAccessRequest(input.id, ctx.user.id)),
});
