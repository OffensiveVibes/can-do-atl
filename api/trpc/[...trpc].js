// server/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/routers/content.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z } from "zod";

// server/cms.ts
var PRIMARY_ADMIN_EMAIL = "candoatltm@gmail.com";
function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? "";
}
function isPrimaryAdministrator(email) {
  return normalizeEmail(email) === PRIMARY_ADMIN_EMAIL;
}
function canCreateStaffAccount(email, invitationStatus) {
  return isPrimaryAdministrator(email) || invitationStatus === "pending" || invitationStatus === "accepted";
}
function isAllowedEditor(user) {
  return Boolean(user && (isPrimaryAdministrator(user.email) || user.role === "admin"));
}

// server/db.ts
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// drizzle/schema.ts
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
var roleEnum = pgEnum("user_role", ["user", "admin"]);
var publishStatusEnum = pgEnum("publish_status", ["draft", "published"]);
var inviteStatusEnum = pgEnum("invite_status", ["pending", "accepted", "revoked"]);
var accessRequestStatusEnum = pgEnum("access_request_status", ["pending", "approved", "denied"]);
var touchedAt = () => timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull().$onUpdateFn(() => /* @__PURE__ */ new Date());
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 128 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull()
});
var siteUpdates = pgTable("siteUpdates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  linkLabel: varchar("linkLabel", { length: 80 }),
  linkHref: varchar("linkHref", { length: 512 }),
  status: publishStatusEnum("status").default("draft").notNull(),
  authorId: integer("authorId").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt()
}, (table) => [index("siteUpdates_status_created_idx").on(table.status, table.createdAt)]);
var events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  campus: varchar("campus", { length: 160 }).notNull(),
  details: text("details"),
  startsAt: timestamp("startsAt", { withTimezone: true }).notNull(),
  endsAt: timestamp("endsAt", { withTimezone: true }),
  linkHref: varchar("linkHref", { length: 512 }),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt()
}, (table) => [index("events_public_starts_idx").on(table.isPublished, table.startsAt)]);
var heroSlides = pgTable("heroSlides", {
  id: serial("id").primaryKey(),
  eyebrow: varchar("eyebrow", { length: 120 }).notNull(),
  headline: varchar("headline", { length: 180 }).notNull(),
  accent: varchar("accent", { length: 180 }),
  body: text("body").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  imageAlt: varchar("imageAlt", { length: 255 }).notNull(),
  volunteerHref: varchar("volunteerHref", { length: 512 }),
  donateHref: varchar("donateHref", { length: 512 }),
  position: integer("position").default(0).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt()
}, (table) => [index("heroSlides_public_position_idx").on(table.isPublished, table.position)]);
var impactMetrics = pgTable("impactMetrics", {
  id: serial("id").primaryKey(),
  metricKey: varchar("metricKey", { length: 64 }).notNull().unique(),
  value: integer("value").default(0).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  position: integer("position").default(0).notNull(),
  updatedBy: integer("updatedBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt()
}, (table) => [index("impactMetrics_position_idx").on(table.position)]);
var teamMembers = pgTable("teamMembers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  role: varchar("role", { length: 160 }).notNull(),
  bio: text("bio"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  imageKey: varchar("imageKey", { length: 512 }),
  linkedinUrl: varchar("linkedinUrl", { length: 512 }),
  instagramUrl: varchar("instagramUrl", { length: 512 }),
  facebookUrl: varchar("facebookUrl", { length: 512 }),
  tiktokUrl: varchar("tiktokUrl", { length: 512 }),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }),
  websiteUrl: varchar("websiteUrl", { length: 512 }),
  position: integer("position").default(0).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt()
}, (table) => [index("teamMembers_public_position_idx").on(table.isPublished, table.position)]);
var siteAppearance = pgTable("siteAppearance", {
  id: integer("id").primaryKey(),
  siteName: varchar("siteName", { length: 80 }).default("Can Do ATL").notNull(),
  tabTitle: varchar("tabTitle", { length: 100 }).default("Can Do ATL \u2014 Student-led mutual aid").notNull(),
  logoUrl: varchar("logoUrl", { length: 512 }).default("").notNull(),
  logoKey: varchar("logoKey", { length: 512 }),
  logoAlt: varchar("logoAlt", { length: 255 }).default("Atlanta pencil surrounded by grocery essentials").notNull(),
  primaryColor: varchar("primaryColor", { length: 32 }).default("#3A5A40").notNull(),
  accentColor: varchar("accentColor", { length: 32 }).default("#BC6C25").notNull(),
  highlightColor: varchar("highlightColor", { length: 32 }).default("#F1CB6B").notNull(),
  inkColor: varchar("inkColor", { length: 32 }).default("#2C2C2C").notNull(),
  buttonShape: varchar("buttonShape", { length: 16 }).default("pill").notNull(),
  pageMode: varchar("pageMode", { length: 16 }).notNull(),
  pageColor: varchar("pageColor", { length: 32 }).notNull(),
  pageGradientFrom: varchar("pageGradientFrom", { length: 32 }).notNull(),
  pageGradientTo: varchar("pageGradientTo", { length: 32 }).notNull(),
  pageImageUrl: varchar("pageImageUrl", { length: 512 }),
  pageImageKey: varchar("pageImageKey", { length: 512 }),
  pageImageBlur: integer("pageImageBlur").default(0).notNull(),
  pageOverlayOpacity: integer("pageOverlayOpacity").default(24).notNull(),
  headerMode: varchar("headerMode", { length: 16 }).notNull(),
  headerColor: varchar("headerColor", { length: 32 }).notNull(),
  headerGradientFrom: varchar("headerGradientFrom", { length: 32 }).notNull(),
  headerGradientTo: varchar("headerGradientTo", { length: 32 }).notNull(),
  headerImageUrl: varchar("headerImageUrl", { length: 512 }),
  headerImageKey: varchar("headerImageKey", { length: 512 }),
  headerImageBlur: integer("headerImageBlur").default(0).notNull(),
  headerOverlayOpacity: integer("headerOverlayOpacity").default(8).notNull(),
  footerMode: varchar("footerMode", { length: 16 }).notNull(),
  footerColor: varchar("footerColor", { length: 32 }).notNull(),
  footerGradientFrom: varchar("footerGradientFrom", { length: 32 }).notNull(),
  footerGradientTo: varchar("footerGradientTo", { length: 32 }).notNull(),
  footerImageUrl: varchar("footerImageUrl", { length: 512 }),
  footerImageKey: varchar("footerImageKey", { length: 512 }),
  footerImageBlur: integer("footerImageBlur").default(0).notNull(),
  footerOverlayOpacity: integer("footerOverlayOpacity").default(36).notNull(),
  updatedBy: integer("updatedBy").notNull(),
  updatedAt: touchedAt()
});
var siteText = pgTable("siteText", {
  id: serial("id").primaryKey(),
  textKey: varchar("textKey", { length: 80 }).notNull().unique(),
  value: text("value").notNull(),
  updatedBy: integer("updatedBy").notNull(),
  updatedAt: touchedAt()
}, (table) => [index("siteText_key_idx").on(table.textKey)]);
var serviceCards = pgTable("serviceCards", {
  id: serial("id").primaryKey(),
  cardKey: varchar("cardKey", { length: 64 }).notNull().unique(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  hoverImageUrl: varchar("hoverImageUrl", { length: 512 }).notNull(),
  hoverImageKey: varchar("hoverImageKey", { length: 512 }),
  imageAlt: varchar("imageAlt", { length: 255 }).notNull(),
  position: integer("position").default(0).notNull(),
  updatedBy: integer("updatedBy").notNull(),
  updatedAt: touchedAt()
}, (table) => [index("serviceCards_position_idx").on(table.position)]);
var adminInvites = pgTable("adminInvites", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  status: inviteStatusEnum("status").default("pending").notNull(),
  invitedBy: integer("invitedBy").notNull(),
  invitedAt: timestamp("invitedAt", { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt", { withTimezone: true })
}, (table) => [index("adminInvites_status_idx").on(table.status)]);
var adminAccessRequests = pgTable("adminAccessRequests", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  note: text("note"),
  status: accessRequestStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requestedAt", { withTimezone: true }).defaultNow().notNull(),
  decidedBy: integer("decidedBy"),
  decidedAt: timestamp("decidedAt", { withTimezone: true })
}, (table) => [index("adminAccessRequests_status_requested_idx").on(table.status, table.requestedAt)]);

// server/impact.ts
var IMPACT_METRIC_KEYS = ["care_packages", "clothing_items", "student_volunteers"];
var DEFAULT_IMPACT_METRICS = [
  { metricKey: "care_packages", value: 0, label: "care packages shared so far \u2014 you can make the difference", position: 0 },
  { metricKey: "clothing_items", value: 0, label: "clothing items recirculated so far \u2014 you can make the difference", position: 1 },
  { metricKey: "student_volunteers", value: 0, label: "student volunteers so far \u2014 you can make the difference", position: 2 }
];

// server/team.ts
var DEFAULT_TEAM_MEMBERS = [
  { name: "Team member slot 01", role: "Add a role in Admin", bio: "This is an editable placeholder profile. Add a photo, name, role, introduction, and social links from the staff workspace.", imageUrl: null, imageKey: null, linkedinUrl: null, instagramUrl: null, facebookUrl: null, tiktokUrl: null, youtubeUrl: null, websiteUrl: null, position: 0, isPublished: true },
  { name: "Team member slot 02", role: "Add a role in Admin", bio: "This is an editable placeholder profile. Add a photo, name, role, introduction, and social links from the staff workspace.", imageUrl: null, imageKey: null, linkedinUrl: null, instagramUrl: null, facebookUrl: null, tiktokUrl: null, youtubeUrl: null, websiteUrl: null, position: 1, isPublished: true },
  { name: "Team member slot 03", role: "Add a role in Admin", bio: "This is an editable placeholder profile. Add a photo, name, role, introduction, and social links from the staff workspace.", imageUrl: null, imageKey: null, linkedinUrl: null, instagramUrl: null, facebookUrl: null, tiktokUrl: null, youtubeUrl: null, websiteUrl: null, position: 2, isPublished: true }
];

// server/appearance.ts
var APPEARANCE_MODES = ["solid", "gradient", "image"];
var BUTTON_SHAPES = ["pill", "soft", "square"];
var SERVICE_CARD_KEYS = ["food_drives", "clothing_closet", "community_outreach"];
var DEFAULT_APPEARANCE = {
  siteName: "Can Do ATL",
  tabTitle: "Can Do ATL \u2014 Student-led mutual aid",
  logoUrl: "",
  logoKey: null,
  logoAlt: "Atlanta pencil surrounded by grocery essentials",
  primaryColor: "#3A5A40",
  accentColor: "#BC6C25",
  highlightColor: "#F1CB6B",
  inkColor: "#2C2C2C",
  buttonShape: "pill",
  pageMode: "solid",
  pageColor: "#F7F3EB",
  pageGradientFrom: "#F7F3EB",
  pageGradientTo: "#E7EDE1",
  pageImageUrl: null,
  pageImageKey: null,
  pageImageBlur: 0,
  pageOverlayOpacity: 24,
  headerMode: "solid",
  headerColor: "#F7F3EB",
  headerGradientFrom: "#F7F3EB",
  headerGradientTo: "#F7F3EB",
  headerImageUrl: null,
  headerImageKey: null,
  headerImageBlur: 0,
  headerOverlayOpacity: 8,
  footerMode: "solid",
  footerColor: "#2C2C2C",
  footerGradientFrom: "#2C2C2C",
  footerGradientTo: "#3A5A40",
  footerImageUrl: null,
  footerImageKey: null,
  footerImageBlur: 0,
  footerOverlayOpacity: 36
};
var DEFAULT_SERVICE_CARDS = [
  { cardKey: "food_drives", imageUrl: "", imageKey: null, hoverImageUrl: "", hoverImageKey: null, imageAlt: "Students organizing food drive supplies", position: 0 },
  { cardKey: "clothing_closet", imageUrl: "", imageKey: null, hoverImageUrl: "", hoverImageKey: null, imageAlt: "Students organizing clothing donations", position: 1 },
  { cardKey: "community_outreach", imageUrl: "", imageKey: null, hoverImageUrl: "", hoverImageKey: null, imageAlt: "Students sharing community care kits", position: 2 }
];

// shared/siteText.ts
var SITE_TEXT_DEFAULTS = {
  heroNote: "Bring what you can. Take what helps.",
  whatWeDoKicker: "What we do",
  whatWeDoHeading: "Care is practical.",
  whatWeDoBody: "We mobilize people, supplies, and campus partnerships so a student\u2019s next step can feel a little more possible.",
  impactKicker: "Our impact",
  impactHeading: "Every item carries a little more room to breathe.",
  impactBody: "When a student has food on the table or clothes that feel ready for the day, a community grows stronger.",
  impactBadge: "A growing community, one drive at a time",
  eventsKicker: "Mark your calendar",
  eventsHeading: "Meet us where care is needed.",
  eventsBody: "Plan around the next chance to pack, sort, share, and make a useful difference close to campus.",
  storiesKicker: "The way we show up",
  storiesHeading: "Care moves through people.",
  storiesBody: "Food and clothing access is never a one-person fix. Here is the shared work that keeps care moving across our campuses.",
  storyOneTitle: "A full shelf can steady a week.",
  storyOneBody: "Food drives turn everyday supplies into breathing room\u2014one grocery bag, one meal, one less worry at a time.",
  storyOneContext: "Food access, made tangible.",
  storyTwoTitle: "A good outfit can change how the day begins.",
  storyTwoBody: "Closet days keep quality clothing in circulation for class, work, interviews, and all the in-between moments.",
  storyTwoContext: "Clothing access, shared freely.",
  storyThreeTitle: "Showing up is a skill we share.",
  storyThreeBody: "Packed bags, sorted racks, and welcoming tables begin when students decide to make room for one another.",
  storyThreeContext: "Mutual aid, in motion.",
  actionKicker: "Make room for someone else",
  actionHeading: "What can you carry forward?",
  actionBody: "Show up for a shift, organize a drive, pass along essentials, or help us keep this campus trail moving.",
  volunteerLabel: "Volunteer with us",
  volunteerSubtext: "Sort, deliver, organize, and welcome",
  essentialsLabel: "Give essentials",
  essentialsSubtext: "Fuel food and clothing access",
  footerDescription: "Three campuses, one connected care network, and a shared belief that essentials should never stand in the way of a student\u2019s next step.",
  socialHelper: "Follow the work. Share a drive. Keep the trail moving.",
  footerTagline: "Built for shared strength.",
  aboutHeading: "We make room for each other.",
  aboutIntro: "Can Do ATL is a student-led, multi-campus organization building practical paths to food and clothing access across Georgia Tech, Georgia State, and Kennesaw State.",
  teamKicker: "The people behind the work",
  teamHeading: "Our team, in their own words.",
  teamIntro: "Click a profile to learn more and find each person\u2019s linked social spaces. Team profiles are managed directly from the private staff workspace.",
  joinKicker: "Want to join the work?",
  joinHeading: "There is room at this table.",
  joinBody: "Bring your organizing skills, practical ideas, or an hour to help. Every contribution strengthens the campus trail."
};
var SITE_TEXT_KEYS = Object.keys(SITE_TEXT_DEFAULTS);

// server/db.ts
var _db = null;
var _client = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, ssl: "require" });
    _db = drizzle(_client);
  }
  return _db;
}
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database connection is unavailable.");
  return db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();
  const normalizedEmail = normalizeEmail(user.email);
  const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
  const invitation = normalizedEmail ? await db.select({ status: adminInvites.status }).from(adminInvites).where(eq(adminInvites.email, normalizedEmail)).limit(1) : [];
  if (!existingUser[0] && !canCreateStaffAccount(normalizedEmail, invitation[0]?.status)) {
    return;
  }
  const values = { openId: user.openId };
  const updateSet = {};
  for (const field of ["name", "email", "loginMethod"]) {
    if (user[field] !== void 0) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (isPrimaryAdministrator(normalizedEmail)) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn = user.lastSignedIn ?? /* @__PURE__ */ new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await requireDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getPublicContent() {
  const db = await requireDb();
  const now = /* @__PURE__ */ new Date();
  const [slides, upcomingEvents, updates, metrics, members, appearanceRows, cards, textRows] = await Promise.all([
    db.select().from(heroSlides).where(eq(heroSlides.isPublished, true)).orderBy(asc(heroSlides.position), asc(heroSlides.id)),
    db.select().from(events).where(and(eq(events.isPublished, true), gte(events.startsAt, now))).orderBy(asc(events.startsAt)).limit(6),
    db.select().from(siteUpdates).where(eq(siteUpdates.status, "published")).orderBy(desc(siteUpdates.createdAt)).limit(3),
    db.select().from(impactMetrics).orderBy(asc(impactMetrics.position), asc(impactMetrics.id)),
    db.select().from(teamMembers).where(eq(teamMembers.isPublished, true)).orderBy(asc(teamMembers.position), asc(teamMembers.id)),
    db.select().from(siteAppearance).limit(1),
    db.select().from(serviceCards).orderBy(asc(serviceCards.position), asc(serviceCards.id)),
    db.select().from(siteText)
  ]);
  const text2 = { ...SITE_TEXT_DEFAULTS, ...Object.fromEntries(textRows.map((item) => [item.textKey, item.value])) };
  return { slides, events: upcomingEvents, updates, impactMetrics: metrics.length ? metrics : DEFAULT_IMPACT_METRICS, teamMembers: members.length ? members : DEFAULT_TEAM_MEMBERS, appearance: appearanceRows[0] ?? DEFAULT_APPEARANCE, serviceCards: cards.length ? cards : DEFAULT_SERVICE_CARDS, siteText: text2 };
}
async function getAdminContent() {
  const db = await requireDb();
  const [slides, allEvents, updates, metrics, members, appearanceRows, cards, textRows] = await Promise.all([
    db.select().from(heroSlides).orderBy(asc(heroSlides.position), asc(heroSlides.id)),
    db.select().from(events).orderBy(asc(events.startsAt)),
    db.select().from(siteUpdates).orderBy(desc(siteUpdates.updatedAt)),
    db.select().from(impactMetrics).orderBy(asc(impactMetrics.position), asc(impactMetrics.id)),
    db.select().from(teamMembers).orderBy(asc(teamMembers.position), asc(teamMembers.id)),
    db.select().from(siteAppearance).limit(1),
    db.select().from(serviceCards).orderBy(asc(serviceCards.position), asc(serviceCards.id)),
    db.select().from(siteText)
  ]);
  const text2 = { ...SITE_TEXT_DEFAULTS, ...Object.fromEntries(textRows.map((item) => [item.textKey, item.value])) };
  return { slides, events: allEvents, updates, impactMetrics: metrics.length ? metrics : DEFAULT_IMPACT_METRICS, teamMembers: members.length ? members : DEFAULT_TEAM_MEMBERS, appearance: appearanceRows[0] ?? DEFAULT_APPEARANCE, serviceCards: cards.length ? cards : DEFAULT_SERVICE_CARDS, siteText: text2 };
}
async function upsertSiteAppearance(input, updatedBy) {
  const db = await requireDb();
  await db.insert(siteAppearance).values({ id: 1, ...input, updatedBy }).onConflictDoUpdate({ target: siteAppearance.id, set: { ...input, updatedBy } });
}
async function upsertSiteText(entries, updatedBy) {
  const db = await requireDb();
  await Promise.all(entries.map((entry) => db.insert(siteText).values({ ...entry, updatedBy }).onConflictDoUpdate({ target: siteText.textKey, set: { value: entry.value, updatedBy } })));
}
async function upsertServiceCards(cards, updatedBy) {
  const db = await requireDb();
  await Promise.all(cards.map((card) => db.insert(serviceCards).values({ ...card, updatedBy }).onConflictDoUpdate({ target: serviceCards.cardKey, set: { imageUrl: card.imageUrl, imageKey: card.imageKey, hoverImageUrl: card.hoverImageUrl, hoverImageKey: card.hoverImageKey, imageAlt: card.imageAlt, position: card.position, updatedBy } })));
}
async function upsertImpactMetrics(metrics, updatedBy) {
  const db = await requireDb();
  await Promise.all(metrics.map((metric) => db.insert(impactMetrics).values({ ...metric, updatedBy }).onConflictDoUpdate({
    target: impactMetrics.metricKey,
    set: { value: metric.value, label: metric.label, position: metric.position, updatedBy }
  })));
}
async function createSiteUpdate(input) {
  const db = await requireDb();
  await db.insert(siteUpdates).values(input);
}
async function updateSiteUpdate(id, input) {
  const db = await requireDb();
  await db.update(siteUpdates).set(input).where(eq(siteUpdates.id, id));
}
async function deleteSiteUpdate(id) {
  const db = await requireDb();
  await db.delete(siteUpdates).where(eq(siteUpdates.id, id));
}
async function createEvent(input) {
  const db = await requireDb();
  await db.insert(events).values(input);
}
async function updateEvent(id, input) {
  const db = await requireDb();
  await db.update(events).set(input).where(eq(events.id, id));
}
async function deleteEvent(id) {
  const db = await requireDb();
  await db.delete(events).where(eq(events.id, id));
}
async function createHeroSlide(input) {
  const db = await requireDb();
  await db.insert(heroSlides).values(input);
}
async function updateHeroSlide(id, input) {
  const db = await requireDb();
  await db.update(heroSlides).set(input).where(eq(heroSlides.id, id));
}
async function deleteHeroSlide(id) {
  const db = await requireDb();
  await db.delete(heroSlides).where(eq(heroSlides.id, id));
}
async function createTeamMember(input) {
  const db = await requireDb();
  await db.insert(teamMembers).values(input);
}
async function updateTeamMember(id, input) {
  const db = await requireDb();
  await db.update(teamMembers).set(input).where(eq(teamMembers.id, id));
}
async function deleteTeamMember(id) {
  const db = await requireDb();
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}
async function reorderTeamMembers(ids) {
  const db = await requireDb();
  const existing = await db.select({ id: teamMembers.id }).from(teamMembers);
  if (existing.length !== ids.length || existing.some((member) => !ids.includes(member.id))) {
    throw new Error("The profile order is out of date. Refresh and try again.");
  }
  await db.transaction(async (tx) => {
    await Promise.all(ids.map((id, position) => tx.update(teamMembers).set({ position }).where(eq(teamMembers.id, id))));
  });
}
async function getInviteForEmail(email) {
  const db = await requireDb();
  const rows = await db.select().from(adminInvites).where(eq(adminInvites.email, normalizeEmail(email))).limit(1);
  return rows[0];
}
async function listInvites() {
  const db = await requireDb();
  return db.select().from(adminInvites).orderBy(desc(adminInvites.invitedAt));
}
async function createOrRefreshInvite(email, invitedBy) {
  const db = await requireDb();
  const normalizedEmail = normalizeEmail(email);
  await db.insert(adminInvites).values({ email: normalizedEmail, invitedBy, status: "pending" }).onConflictDoUpdate({ target: adminInvites.email, set: { status: "pending", invitedBy, invitedAt: /* @__PURE__ */ new Date(), acceptedAt: null } });
}
async function revokeInvite(id) {
  const db = await requireDb();
  await db.update(adminInvites).set({ status: "revoked" }).where(eq(adminInvites.id, id));
}
async function acceptInviteForUser(email, userId) {
  const db = await requireDb();
  const normalizedEmail = normalizeEmail(email);
  const invite = await getInviteForEmail(normalizedEmail);
  if (!invite || invite.status !== "pending") return false;
  await db.update(adminInvites).set({ status: "accepted", acceptedAt: /* @__PURE__ */ new Date() }).where(eq(adminInvites.id, invite.id));
  await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
  return true;
}
async function createOrRefreshAccessRequest(email, note) {
  const db = await requireDb();
  const normalizedEmail = normalizeEmail(email);
  await db.insert(adminAccessRequests).values({ email: normalizedEmail, note, status: "pending" }).onConflictDoUpdate({
    target: adminAccessRequests.email,
    set: { note, status: "pending", requestedAt: /* @__PURE__ */ new Date(), decidedBy: null, decidedAt: null }
  });
}
async function listAccessRequests() {
  const db = await requireDb();
  return db.select().from(adminAccessRequests).orderBy(desc(adminAccessRequests.requestedAt));
}
async function approveAccessRequest(id, decidedBy) {
  const db = await requireDb();
  const request = await db.select().from(adminAccessRequests).where(eq(adminAccessRequests.id, id)).limit(1);
  if (!request[0]) throw new Error("That administrator request no longer exists.");
  await db.transaction(async (tx) => {
    await tx.insert(adminInvites).values({ email: request[0].email, invitedBy: decidedBy, status: "pending" }).onConflictDoUpdate({
      target: adminInvites.email,
      set: { status: "pending", invitedBy: decidedBy, invitedAt: /* @__PURE__ */ new Date(), acceptedAt: null }
    });
    await tx.update(adminAccessRequests).set({ status: "approved", decidedBy, decidedAt: /* @__PURE__ */ new Date() }).where(eq(adminAccessRequests.id, id));
  });
}
async function denyAccessRequest(id, decidedBy) {
  const db = await requireDb();
  await db.update(adminAccessRequests).set({ status: "denied", decidedBy, decidedAt: /* @__PURE__ */ new Date() }).where(eq(adminAccessRequests.id, id));
}

// server/authorization.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
var editorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isAllowedEditor(ctx.user)) {
    throw new TRPCError2({ code: "FORBIDDEN", message: "Administrator access is required." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
var primaryAdministratorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isPrimaryAdministrator(ctx.user.email)) {
    throw new TRPCError2({ code: "FORBIDDEN", message: "Only the primary Can Do ATL administrator can manage access." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
var url = process.env.VITE_SUPABASE_URL;
var serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.warn("Supabase server configuration is incomplete. Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel before deploying.");
}
var supabaseAdmin = createClient(
  url ?? "https://placeholder.supabase.co",
  serviceRoleKey ?? "placeholder",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
async function getSupabaseIdentity(accessToken) {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

// server/storage.ts
var BUCKET = "site-media";
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = appendHashSuffix(normalizeKey(relKey));
  const body = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const { data: uploaded, error } = await supabaseAdmin.storage.from(BUCKET).upload(key, body, { contentType, upsert: false });
  if (error || !uploaded) throw new Error(`Supabase Storage upload failed: ${error?.message ?? "unknown error"}`);
  const { data: publicUrl } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(uploaded.path);
  return { key: uploaded.path, url: publicUrl.publicUrl };
}

// server/routers/content.ts
var optionalText = z.string().trim().max(512).optional().transform((value) => value || void 0);
var editorEventInput = z.object({
  title: z.string().trim().min(2).max(160),
  campus: z.string().trim().min(2).max(160),
  details: z.string().trim().max(5e3).optional().transform((value) => value || void 0),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  linkHref: optionalText,
  isPublished: z.boolean()
});
var editorUpdateInput = z.object({
  title: z.string().trim().min(2).max(160),
  body: z.string().trim().min(2).max(5e3),
  linkLabel: z.string().trim().max(80).optional().transform((value) => value || void 0),
  linkHref: optionalText,
  status: z.enum(["draft", "published"])
});
var editorSlideInput = z.object({
  eyebrow: z.string().trim().min(2).max(120),
  headline: z.string().trim().min(2).max(180),
  accent: z.string().trim().max(180).optional().transform((value) => value || void 0),
  body: z.string().trim().min(2).max(5e3),
  imageUrl: z.string().trim().min(1).max(512),
  imageKey: z.string().trim().max(512).optional().transform((value) => value || void 0),
  imageAlt: z.string().trim().min(3).max(255),
  volunteerHref: optionalText,
  donateHref: optionalText,
  position: z.number().int().min(0).max(999),
  isPublished: z.boolean()
});
var impactMetricInput = z.object({
  metricKey: z.enum(IMPACT_METRIC_KEYS),
  value: z.number().int().min(0).max(1e9),
  label: z.string().trim().min(4).max(180),
  position: z.number().int().min(0).max(2)
});
var impactMetricsInput = z.object({
  metrics: z.array(impactMetricInput).length(3).superRefine((metrics, ctx) => {
    const keys = metrics.map((metric) => metric.metricKey);
    if (new Set(keys).size !== IMPACT_METRIC_KEYS.length || !IMPACT_METRIC_KEYS.every((key) => keys.includes(key))) {
      ctx.addIssue({ code: "custom", message: "Provide each public impact metric exactly once." });
    }
  })
});
var optionalUrl = z.string().trim().url().max(512).optional().or(z.literal("")).transform((value) => value || void 0);
var colorInput = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a six-digit hex color.");
var managedImageUrl = z.string().trim().min(1).max(512).url("Use an uploaded Supabase image URL.");
var optionalImageUrl = managedImageUrl.optional().or(z.literal("")).transform((value) => value || void 0);
var editorTeamMemberInput = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(160),
  bio: z.string().trim().max(5e3).optional().transform((value) => value || void 0),
  imageUrl: optionalImageUrl,
  imageKey: z.string().trim().max(512).optional().transform((value) => value || void 0),
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  websiteUrl: optionalUrl,
  position: z.number().int().min(0).max(999),
  isPublished: z.boolean()
});
var appearanceInput = z.object({
  siteName: z.string().trim().min(2).max(80),
  tabTitle: z.string().trim().min(2).max(100),
  logoUrl: optionalImageUrl,
  logoKey: optionalText,
  logoAlt: z.string().trim().min(3).max(255),
  primaryColor: colorInput,
  accentColor: colorInput,
  highlightColor: colorInput,
  inkColor: colorInput,
  buttonShape: z.enum(BUTTON_SHAPES),
  pageMode: z.enum(APPEARANCE_MODES),
  pageColor: colorInput,
  pageGradientFrom: colorInput,
  pageGradientTo: colorInput,
  pageImageUrl: optionalImageUrl,
  pageImageKey: optionalText,
  pageImageBlur: z.number().int().min(0).max(24),
  pageOverlayOpacity: z.number().int().min(0).max(92),
  headerMode: z.enum(APPEARANCE_MODES),
  headerColor: colorInput,
  headerGradientFrom: colorInput,
  headerGradientTo: colorInput,
  headerImageUrl: optionalImageUrl,
  headerImageKey: optionalText,
  headerImageBlur: z.number().int().min(0).max(24),
  headerOverlayOpacity: z.number().int().min(0).max(92),
  footerMode: z.enum(APPEARANCE_MODES),
  footerColor: colorInput,
  footerGradientFrom: colorInput,
  footerGradientTo: colorInput,
  footerImageUrl: optionalImageUrl,
  footerImageKey: optionalText,
  footerImageBlur: z.number().int().min(0).max(24),
  footerOverlayOpacity: z.number().int().min(0).max(92)
});
var serviceCardInput = z.object({ cardKey: z.enum(SERVICE_CARD_KEYS), imageUrl: managedImageUrl, imageKey: optionalText, hoverImageUrl: managedImageUrl, hoverImageKey: optionalText, imageAlt: z.string().trim().min(3).max(255), position: z.number().int().min(0).max(2) });
var serviceCardsInput = z.object({ cards: z.array(serviceCardInput).length(3).superRefine((cards, ctx) => {
  const keys = cards.map((card) => card.cardKey);
  if (new Set(keys).size !== SERVICE_CARD_KEYS.length || !SERVICE_CARD_KEYS.every((key) => keys.includes(key))) ctx.addIssue({ code: "custom", message: "Provide each service card exactly once." });
}) });
var siteTextInput = z.object({ entries: z.array(z.object({ textKey: z.enum(SITE_TEXT_KEYS), value: z.string().trim().min(1).max(5e3) })).length(SITE_TEXT_KEYS.length).superRefine((entries, ctx) => {
  const keys = entries.map((entry) => entry.textKey);
  if (new Set(keys).size !== SITE_TEXT_KEYS.length || !SITE_TEXT_KEYS.every((key) => keys.includes(key))) ctx.addIssue({ code: "custom", message: "Provide every editable website text field exactly once." });
}) });
var profileOrderInput = z.object({ ids: z.array(z.number().int().positive()).min(1).max(200).superRefine((ids, ctx) => {
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Each team profile can only appear once." });
}) });
var accessRequestInput = z.object({ email: z.string().trim().email().max(320), note: z.string().trim().max(1e3).optional().transform((value) => value || void 0) });
function parseImageDataUrl(dataUrl) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new TRPCError3({ code: "BAD_REQUEST", message: "Choose a PNG, JPEG, or WebP image." });
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.byteLength > 45e5) throw new TRPCError3({ code: "PAYLOAD_TOO_LARGE", message: "Images must be smaller than 4.5 MB." });
  const extension = match[1] === "image/jpeg" ? "jpg" : match[1].replace("image/", "");
  return { bytes, contentType: match[1], extension };
}
var contentRouter = router({
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
  updateSiteText: editorProcedure.input(siteTextInput).mutation(({ ctx, input }) => upsertSiteText(input.entries, ctx.user.id)),
  updateServiceCards: editorProcedure.input(serviceCardsInput).mutation(({ ctx, input }) => upsertServiceCards(input.cards, ctx.user.id)),
  uploadHeroImage: editorProcedure.input(z.object({ dataUrl: z.string().max(63e5) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`hero-slides/${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
  uploadTeamImage: editorProcedure.input(z.object({ dataUrl: z.string().max(63e5) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`team-members/${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
  uploadAppearanceImage: editorProcedure.input(z.object({ dataUrl: z.string().max(63e5), surface: z.enum(["page", "header", "footer"]) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`appearance/${input.surface}-${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
  uploadBrandImage: editorProcedure.input(z.object({ dataUrl: z.string().max(63e5) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`branding/logo-${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  }),
  uploadServiceCardImage: editorProcedure.input(z.object({ dataUrl: z.string().max(63e5), cardKey: z.enum(SERVICE_CARD_KEYS), state: z.enum(["default", "hover"]) })).mutation(async ({ ctx, input }) => {
    const image = parseImageDataUrl(input.dataUrl);
    return storagePut(`service-cards/${input.cardKey}-${input.state}-${ctx.user.id}-${Date.now()}.${image.extension}`, image.bytes, image.contentType);
  })
});
var accessRouter = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const primary = isPrimaryAdministrator(ctx.user.email);
    const canEdit = isAllowedEditor(ctx.user);
    const invite = ctx.user.email ? await getInviteForEmail(ctx.user.email) : void 0;
    return { canEdit, primary, inviteStatus: invite?.status ?? null };
  }),
  acceptInvitation: protectedProcedure.mutation(async ({ ctx }) => {
    if (isPrimaryAdministrator(ctx.user.email)) return { activated: true };
    if (!ctx.user.email) throw new TRPCError3({ code: "FORBIDDEN", message: "A verified email address is required." });
    return { activated: await acceptInviteForUser(ctx.user.email, ctx.user.id) };
  }),
  listInvites: primaryAdministratorProcedure.query(() => listInvites()),
  invite: primaryAdministratorProcedure.input(z.object({ email: z.string().email().max(320) })).mutation(({ ctx, input }) => {
    const email = normalizeEmail(input.email);
    if (isPrimaryAdministrator(email)) throw new TRPCError3({ code: "BAD_REQUEST", message: "The primary administrator already has access." });
    return createOrRefreshInvite(email, ctx.user.id);
  }),
  revoke: primaryAdministratorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => revokeInvite(input.id)),
  submitRequest: publicProcedure.input(accessRequestInput).mutation(async ({ input }) => {
    const email = normalizeEmail(input.email);
    if (isPrimaryAdministrator(email)) throw new TRPCError3({ code: "BAD_REQUEST", message: "This is already the primary administrator email." });
    await createOrRefreshAccessRequest(email, input.note);
    return { submitted: true };
  }),
  listRequests: editorProcedure.query(() => listAccessRequests()),
  approveRequest: editorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => approveAccessRequest(input.id, ctx.user.id)),
  denyRequest: editorProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => denyAccessRequest(input.id, ctx.user.id))
});

// server/routers.ts
var appRouter = router({
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(() => {
      return { success: true };
    })
  }),
  content: contentRouter,
  access: accessRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  const authHeader = opts.req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) {
    try {
      const identity = await getSupabaseIdentity(token);
      if (identity?.email) {
        await upsertUser({
          openId: identity.id,
          email: identity.email,
          name: identity.user_metadata.full_name ?? identity.email,
          loginMethod: "supabase",
          lastSignedIn: /* @__PURE__ */ new Date()
        });
        user = await getUserByOpenId(identity.id) ?? null;
        if (user) {
          await acceptInviteForUser(identity.email, user.id);
          user = await getUserByOpenId(identity.id) ?? user;
        }
      }
    } catch {
      user = null;
    }
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/app.ts
function createApp() {
  const app = express();
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ limit: "8mb", extended: true }));
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  return app;
}
var app_default = createApp();
export {
  createApp,
  app_default as default
};
