import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/** Core user table backing Manus OAuth. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Publicly visible notices written in the private administration workspace. */
export const siteUpdates = mysqlTable(
  "siteUpdates",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    body: text("body").notNull(),
    linkLabel: varchar("linkLabel", { length: 80 }),
    linkHref: varchar("linkHref", { length: 512 }),
    status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
    authorId: int("authorId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("siteUpdates_status_created_idx").on(table.status, table.createdAt)],
);

/** Upcoming campus events. All timestamps are stored in UTC. */
export const events = mysqlTable(
  "events",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 160 }).notNull(),
    campus: varchar("campus", { length: 160 }).notNull(),
    details: text("details"),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt"),
    linkHref: varchar("linkHref", { length: 512 }),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("events_public_starts_idx").on(table.isPublished, table.startsAt)],
);

/** Administrators control the timed public hero carousel through these records. */
export const heroSlides = mysqlTable(
  "heroSlides",
  {
    id: int("id").autoincrement().primaryKey(),
    eyebrow: varchar("eyebrow", { length: 120 }).notNull(),
    headline: varchar("headline", { length: 180 }).notNull(),
    accent: varchar("accent", { length: 180 }),
    body: text("body").notNull(),
    imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
    imageKey: varchar("imageKey", { length: 512 }),
    imageAlt: varchar("imageAlt", { length: 255 }).notNull(),
    volunteerHref: varchar("volunteerHref", { length: 512 }),
    donateHref: varchar("donateHref", { length: 512 }),
    position: int("position").default(0).notNull(),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("heroSlides_public_position_idx").on(table.isPublished, table.position)],
);

/** Three administrator-maintained public impact counters. */
export const impactMetrics = mysqlTable(
  "impactMetrics",
  {
    id: int("id").autoincrement().primaryKey(),
    metricKey: varchar("metricKey", { length: 64 }).notNull().unique(),
    value: int("value").default(0).notNull(),
    label: varchar("label", { length: 180 }).notNull(),
    position: int("position").default(0).notNull(),
    updatedBy: int("updatedBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("impactMetrics_position_idx").on(table.position)],
);

/** Public About Us profiles, controlled through the protected staff workspace. */
export const teamMembers = mysqlTable(
  "teamMembers",
  {
    id: int("id").autoincrement().primaryKey(),
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
    position: int("position").default(0).notNull(),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("teamMembers_public_position_idx").on(table.isPublished, table.position)],
);

/** Primary-administrator managed allow-list for additional administrators. */
export const adminInvites = mysqlTable(
  "adminInvites",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    status: mysqlEnum("status", ["pending", "accepted", "revoked"]).default("pending").notNull(),
    invitedBy: int("invitedBy").notNull(),
    invitedAt: timestamp("invitedAt").defaultNow().notNull(),
    acceptedAt: timestamp("acceptedAt"),
  },
  (table) => [index("adminInvites_status_idx").on(table.status)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SiteUpdate = typeof siteUpdates.$inferSelect;
export type Event = typeof events.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type ImpactMetric = typeof impactMetrics.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type AdminInvite = typeof adminInvites.$inferSelect;
