import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const roleEnum = pgEnum("user_role", ["user", "admin"]);
const publishStatusEnum = pgEnum("publish_status", ["draft", "published"]);
const inviteStatusEnum = pgEnum("invite_status", ["pending", "accepted", "revoked"]);
const accessRequestStatusEnum = pgEnum("access_request_status", ["pending", "approved", "denied"]);
const touchedAt = () => timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull().$onUpdateFn(() => new Date());

/** App profile records are linked to Supabase Auth user IDs, not a managed OAuth provider. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 128 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export const siteUpdates = pgTable("siteUpdates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  linkLabel: varchar("linkLabel", { length: 80 }),
  linkHref: varchar("linkHref", { length: 512 }),
  status: publishStatusEnum("status").default("draft").notNull(),
  authorId: integer("authorId").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt(),
}, (table) => [index("siteUpdates_status_created_idx").on(table.status, table.createdAt)]);

export const events = pgTable("events", {
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
  updatedAt: touchedAt(),
}, (table) => [index("events_public_starts_idx").on(table.isPublished, table.startsAt)]);

export const heroSlides = pgTable("heroSlides", {
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
  updatedAt: touchedAt(),
}, (table) => [index("heroSlides_public_position_idx").on(table.isPublished, table.position)]);

export const impactMetrics = pgTable("impactMetrics", {
  id: serial("id").primaryKey(),
  metricKey: varchar("metricKey", { length: 64 }).notNull().unique(),
  value: integer("value").default(0).notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  position: integer("position").default(0).notNull(),
  updatedBy: integer("updatedBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: touchedAt(),
}, (table) => [index("impactMetrics_position_idx").on(table.position)]);

export const teamMembers = pgTable("teamMembers", {
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
  updatedAt: touchedAt(),
}, (table) => [index("teamMembers_public_position_idx").on(table.isPublished, table.position)]);

export const siteAppearance = pgTable("siteAppearance", {
  id: integer("id").primaryKey(),
  siteName: varchar("siteName", { length: 80 }).default("Can Do ATL").notNull(),
  tabTitle: varchar("tabTitle", { length: 100 }).default("Can Do ATL — Student-led mutual aid").notNull(),
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
  updatedAt: touchedAt(),
});

export const siteText = pgTable("siteText", {
  id: serial("id").primaryKey(),
  textKey: varchar("textKey", { length: 80 }).notNull().unique(),
  value: text("value").notNull(),
  updatedBy: integer("updatedBy").notNull(),
  updatedAt: touchedAt(),
}, (table) => [index("siteText_key_idx").on(table.textKey)]);

export const serviceCards = pgTable("serviceCards", {
  id: serial("id").primaryKey(),
  cardKey: varchar("cardKey", { length: 64 }).notNull().unique(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  hoverImageUrl: varchar("hoverImageUrl", { length: 512 }).notNull(),
  hoverImageKey: varchar("hoverImageKey", { length: 512 }),
  imageAlt: varchar("imageAlt", { length: 255 }).notNull(),
  position: integer("position").default(0).notNull(),
  updatedBy: integer("updatedBy").notNull(),
  updatedAt: touchedAt(),
}, (table) => [index("serviceCards_position_idx").on(table.position)]);

export const adminInvites = pgTable("adminInvites", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  status: inviteStatusEnum("status").default("pending").notNull(),
  invitedBy: integer("invitedBy").notNull(),
  invitedAt: timestamp("invitedAt", { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt", { withTimezone: true }),
}, (table) => [index("adminInvites_status_idx").on(table.status)]);

export const adminAccessRequests = pgTable("adminAccessRequests", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  note: text("note"),
  status: accessRequestStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requestedAt", { withTimezone: true }).defaultNow().notNull(),
  decidedBy: integer("decidedBy"),
  decidedAt: timestamp("decidedAt", { withTimezone: true }),
}, (table) => [index("adminAccessRequests_status_requested_idx").on(table.status, table.requestedAt)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SiteUpdate = typeof siteUpdates.$inferSelect;
export type Event = typeof events.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type ImpactMetric = typeof impactMetrics.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type SiteAppearance = typeof siteAppearance.$inferSelect;
export type SiteText = typeof siteText.$inferSelect;
export type ServiceCard = typeof serviceCards.$inferSelect;
export type AdminInvite = typeof adminInvites.$inferSelect;
export type AdminAccessRequest = typeof adminAccessRequests.$inferSelect;
