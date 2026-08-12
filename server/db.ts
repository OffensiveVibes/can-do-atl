import { and, asc, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  adminInvites,
  events,
  heroSlides,
  impactMetrics,
  InsertUser,
  serviceCards,
  siteAppearance,
  siteUpdates,
  teamMembers,
  users,
} from "../drizzle/schema";
import { canCreateStaffAccount, isPrimaryAdministrator, normalizeEmail } from "./cms";
import { DEFAULT_IMPACT_METRICS, type ImpactMetricKey } from "./impact";
import { DEFAULT_TEAM_MEMBERS } from "./team";
import { DEFAULT_APPEARANCE, DEFAULT_SERVICE_CARDS, type AppearanceMode, type ButtonShape } from "./appearance";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const normalizedEmail = normalizeEmail(user.email);
  const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
  const invitation = normalizedEmail
    ? await db.select({ status: adminInvites.status }).from(adminInvites).where(eq(adminInvites.email, normalizedEmail)).limit(1)
    : [];

  if (!existingUser[0] && !canCreateStaffAccount(normalizedEmail, invitation[0]?.status)) {
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }

  if (isPrimaryAdministrator(normalizedEmail)) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await requireDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getPublicContent() {
  const db = await requireDb();
  const now = new Date();
  const [slides, upcomingEvents, updates, metrics, members, appearanceRows, cards] = await Promise.all([
    db.select().from(heroSlides).where(eq(heroSlides.isPublished, true)).orderBy(asc(heroSlides.position), asc(heroSlides.id)),
    db.select().from(events).where(and(eq(events.isPublished, true), gte(events.startsAt, now))).orderBy(asc(events.startsAt)).limit(6),
    db.select().from(siteUpdates).where(eq(siteUpdates.status, "published")).orderBy(desc(siteUpdates.createdAt)).limit(3),
    db.select().from(impactMetrics).orderBy(asc(impactMetrics.position), asc(impactMetrics.id)),
    db.select().from(teamMembers).where(eq(teamMembers.isPublished, true)).orderBy(asc(teamMembers.position), asc(teamMembers.id)),
    db.select().from(siteAppearance).limit(1),
    db.select().from(serviceCards).orderBy(asc(serviceCards.position), asc(serviceCards.id)),
  ]);
  return { slides, events: upcomingEvents, updates, impactMetrics: metrics.length ? metrics : DEFAULT_IMPACT_METRICS, teamMembers: members.length ? members : DEFAULT_TEAM_MEMBERS, appearance: appearanceRows[0] ?? DEFAULT_APPEARANCE, serviceCards: cards.length ? cards : DEFAULT_SERVICE_CARDS };
}

export async function getAdminContent() {
  const db = await requireDb();
  const [slides, allEvents, updates, metrics, members, appearanceRows, cards] = await Promise.all([
    db.select().from(heroSlides).orderBy(asc(heroSlides.position), asc(heroSlides.id)),
    db.select().from(events).orderBy(asc(events.startsAt)),
    db.select().from(siteUpdates).orderBy(desc(siteUpdates.updatedAt)),
    db.select().from(impactMetrics).orderBy(asc(impactMetrics.position), asc(impactMetrics.id)),
    db.select().from(teamMembers).orderBy(asc(teamMembers.position), asc(teamMembers.id)),
    db.select().from(siteAppearance).limit(1),
    db.select().from(serviceCards).orderBy(asc(serviceCards.position), asc(serviceCards.id)),
  ]);
  return { slides, events: allEvents, updates, impactMetrics: metrics.length ? metrics : DEFAULT_IMPACT_METRICS, teamMembers: members.length ? members : DEFAULT_TEAM_MEMBERS, appearance: appearanceRows[0] ?? DEFAULT_APPEARANCE, serviceCards: cards.length ? cards : DEFAULT_SERVICE_CARDS };
}

export type AppearanceInput = {
  siteName: string; tabTitle: string; logoUrl?: string; logoKey?: string; logoAlt: string; primaryColor: string; accentColor: string; highlightColor: string; inkColor: string; buttonShape: ButtonShape;
  pageMode: AppearanceMode; pageColor: string; pageGradientFrom: string; pageGradientTo: string; pageImageUrl?: string; pageImageKey?: string; pageImageBlur: number; pageOverlayOpacity: number;
  headerMode: AppearanceMode; headerColor: string; headerGradientFrom: string; headerGradientTo: string; headerImageUrl?: string; headerImageKey?: string; headerImageBlur: number; headerOverlayOpacity: number;
  footerMode: AppearanceMode; footerColor: string; footerGradientFrom: string; footerGradientTo: string; footerImageUrl?: string; footerImageKey?: string; footerImageBlur: number; footerOverlayOpacity: number;
};

export async function upsertSiteAppearance(input: AppearanceInput, updatedBy: number) {
  const db = await requireDb();
  await db.insert(siteAppearance).values({ id: 1, ...input, updatedBy }).onDuplicateKeyUpdate({ set: { ...input, updatedBy } });
}

export async function upsertServiceCards(cards: Array<{ cardKey: string; imageUrl: string; imageKey?: string; hoverImageUrl: string; hoverImageKey?: string; imageAlt: string; position: number }>, updatedBy: number) {
  const db = await requireDb();
  await Promise.all(cards.map((card) => db.insert(serviceCards).values({ ...card, updatedBy }).onDuplicateKeyUpdate({ set: { imageUrl: card.imageUrl, imageKey: card.imageKey, hoverImageUrl: card.hoverImageUrl, hoverImageKey: card.hoverImageKey, imageAlt: card.imageAlt, position: card.position, updatedBy } })));
}

export async function upsertImpactMetrics(metrics: Array<{ metricKey: ImpactMetricKey; value: number; label: string; position: number }>, updatedBy: number) {
  const db = await requireDb();
  await Promise.all(metrics.map((metric) => db.insert(impactMetrics).values({ ...metric, updatedBy }).onDuplicateKeyUpdate({
    set: { value: metric.value, label: metric.label, position: metric.position, updatedBy },
  })));
}

export async function createSiteUpdate(input: { title: string; body: string; linkLabel?: string; linkHref?: string; status: "draft" | "published"; authorId: number }) {
  const db = await requireDb();
  await db.insert(siteUpdates).values(input);
}

export async function updateSiteUpdate(id: number, input: { title: string; body: string; linkLabel?: string; linkHref?: string; status: "draft" | "published" }) {
  const db = await requireDb();
  await db.update(siteUpdates).set(input).where(eq(siteUpdates.id, id));
}

export async function deleteSiteUpdate(id: number) {
  const db = await requireDb();
  await db.delete(siteUpdates).where(eq(siteUpdates.id, id));
}

export async function createEvent(input: { title: string; campus: string; details?: string; startsAt: Date; endsAt?: Date; linkHref?: string; isPublished: boolean; createdBy: number }) {
  const db = await requireDb();
  await db.insert(events).values(input);
}

export async function updateEvent(id: number, input: { title: string; campus: string; details?: string; startsAt: Date; endsAt?: Date; linkHref?: string; isPublished: boolean }) {
  const db = await requireDb();
  await db.update(events).set(input).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await requireDb();
  await db.delete(events).where(eq(events.id, id));
}

export async function createHeroSlide(input: { eyebrow: string; headline: string; accent?: string; body: string; imageUrl: string; imageKey?: string; imageAlt: string; volunteerHref?: string; donateHref?: string; position: number; isPublished: boolean; createdBy: number }) {
  const db = await requireDb();
  await db.insert(heroSlides).values(input);
}

export async function updateHeroSlide(id: number, input: { eyebrow: string; headline: string; accent?: string; body: string; imageUrl: string; imageKey?: string; imageAlt: string; volunteerHref?: string; donateHref?: string; position: number; isPublished: boolean }) {
  const db = await requireDb();
  await db.update(heroSlides).set(input).where(eq(heroSlides.id, id));
}

export async function deleteHeroSlide(id: number) {
  const db = await requireDb();
  await db.delete(heroSlides).where(eq(heroSlides.id, id));
}

export async function createTeamMember(input: { name: string; role: string; bio?: string; imageUrl?: string; imageKey?: string; linkedinUrl?: string; instagramUrl?: string; facebookUrl?: string; tiktokUrl?: string; youtubeUrl?: string; websiteUrl?: string; position: number; isPublished: boolean; createdBy: number }) {
  const db = await requireDb();
  await db.insert(teamMembers).values(input);
}

export async function updateTeamMember(id: number, input: { name: string; role: string; bio?: string; imageUrl?: string; imageKey?: string; linkedinUrl?: string; instagramUrl?: string; facebookUrl?: string; tiktokUrl?: string; youtubeUrl?: string; websiteUrl?: string; position: number; isPublished: boolean }) {
  const db = await requireDb();
  await db.update(teamMembers).set(input).where(eq(teamMembers.id, id));
}

export async function deleteTeamMember(id: number) {
  const db = await requireDb();
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

export async function getInviteForEmail(email: string) {
  const db = await requireDb();
  const rows = await db.select().from(adminInvites).where(eq(adminInvites.email, normalizeEmail(email))).limit(1);
  return rows[0];
}

export async function listInvites() {
  const db = await requireDb();
  return db.select().from(adminInvites).orderBy(desc(adminInvites.invitedAt));
}

export async function createOrRefreshInvite(email: string, invitedBy: number) {
  const db = await requireDb();
  const normalizedEmail = normalizeEmail(email);
  await db.insert(adminInvites).values({ email: normalizedEmail, invitedBy, status: "pending" }).onDuplicateKeyUpdate({ set: { status: "pending", invitedBy, invitedAt: new Date(), acceptedAt: null } });
}

export async function revokeInvite(id: number) {
  const db = await requireDb();
  await db.update(adminInvites).set({ status: "revoked" }).where(eq(adminInvites.id, id));
}

export async function acceptInviteForUser(email: string, userId: number) {
  const db = await requireDb();
  const normalizedEmail = normalizeEmail(email);
  const invite = await getInviteForEmail(normalizedEmail);
  if (!invite || invite.status !== "pending") return false;
  await db.update(adminInvites).set({ status: "accepted", acceptedAt: new Date() }).where(eq(adminInvites.id, invite.id));
  await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
  return true;
}
