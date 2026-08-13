CREATE TYPE "access_request_status" AS ENUM ('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TYPE "invite_status" AS ENUM ('pending', 'accepted', 'revoked');--> statement-breakpoint
CREATE TYPE "publish_status" AS ENUM ('draft', 'published');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM ('user', 'admin');--> statement-breakpoint
CREATE TABLE "adminAccessRequests" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"note" text,
	"status" "access_request_status" DEFAULT 'pending' NOT NULL,
	"requestedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"decidedBy" integer,
	"decidedAt" timestamp with time zone,
	CONSTRAINT "adminAccessRequests_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "adminInvites" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"status" "invite_status" DEFAULT 'pending' NOT NULL,
	"invitedBy" integer NOT NULL,
	"invitedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"acceptedAt" timestamp with time zone,
	CONSTRAINT "adminInvites_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"campus" varchar(160) NOT NULL,
	"details" text,
	"startsAt" timestamp with time zone NOT NULL,
	"endsAt" timestamp with time zone,
	"linkHref" varchar(512),
	"isPublished" boolean DEFAULT true NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "heroSlides" (
	"id" serial PRIMARY KEY NOT NULL,
	"eyebrow" varchar(120) NOT NULL,
	"headline" varchar(180) NOT NULL,
	"accent" varchar(180),
	"body" text NOT NULL,
	"imageUrl" varchar(512) NOT NULL,
	"imageKey" varchar(512),
	"imageAlt" varchar(255) NOT NULL,
	"volunteerHref" varchar(512),
	"donateHref" varchar(512),
	"position" integer DEFAULT 0 NOT NULL,
	"isPublished" boolean DEFAULT true NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impactMetrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metricKey" varchar(64) NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"label" varchar(180) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"updatedBy" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "impactMetrics_metricKey_unique" UNIQUE("metricKey")
);
--> statement-breakpoint
CREATE TABLE "serviceCards" (
	"id" serial PRIMARY KEY NOT NULL,
	"cardKey" varchar(64) NOT NULL,
	"imageUrl" varchar(512) NOT NULL,
	"imageKey" varchar(512),
	"hoverImageUrl" varchar(512) NOT NULL,
	"hoverImageKey" varchar(512),
	"imageAlt" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"updatedBy" integer NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "serviceCards_cardKey_unique" UNIQUE("cardKey")
);
--> statement-breakpoint
CREATE TABLE "siteAppearance" (
	"id" integer PRIMARY KEY NOT NULL,
	"siteName" varchar(80) DEFAULT 'Can Do ATL' NOT NULL,
	"tabTitle" varchar(100) DEFAULT 'Can Do ATL — Student-led mutual aid' NOT NULL,
	"logoUrl" varchar(512) DEFAULT '' NOT NULL,
	"logoKey" varchar(512),
	"logoAlt" varchar(255) DEFAULT 'Atlanta pencil surrounded by grocery essentials' NOT NULL,
	"primaryColor" varchar(32) DEFAULT '#3A5A40' NOT NULL,
	"accentColor" varchar(32) DEFAULT '#BC6C25' NOT NULL,
	"highlightColor" varchar(32) DEFAULT '#F1CB6B' NOT NULL,
	"inkColor" varchar(32) DEFAULT '#2C2C2C' NOT NULL,
	"buttonShape" varchar(16) DEFAULT 'pill' NOT NULL,
	"pageMode" varchar(16) NOT NULL,
	"pageColor" varchar(32) NOT NULL,
	"pageGradientFrom" varchar(32) NOT NULL,
	"pageGradientTo" varchar(32) NOT NULL,
	"pageImageUrl" varchar(512),
	"pageImageKey" varchar(512),
	"pageImageBlur" integer DEFAULT 0 NOT NULL,
	"pageOverlayOpacity" integer DEFAULT 24 NOT NULL,
	"headerMode" varchar(16) NOT NULL,
	"headerColor" varchar(32) NOT NULL,
	"headerGradientFrom" varchar(32) NOT NULL,
	"headerGradientTo" varchar(32) NOT NULL,
	"headerImageUrl" varchar(512),
	"headerImageKey" varchar(512),
	"headerImageBlur" integer DEFAULT 0 NOT NULL,
	"headerOverlayOpacity" integer DEFAULT 8 NOT NULL,
	"footerMode" varchar(16) NOT NULL,
	"footerColor" varchar(32) NOT NULL,
	"footerGradientFrom" varchar(32) NOT NULL,
	"footerGradientTo" varchar(32) NOT NULL,
	"footerImageUrl" varchar(512),
	"footerImageKey" varchar(512),
	"footerImageBlur" integer DEFAULT 0 NOT NULL,
	"footerOverlayOpacity" integer DEFAULT 36 NOT NULL,
	"updatedBy" integer NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "siteText" (
	"id" serial PRIMARY KEY NOT NULL,
	"textKey" varchar(80) NOT NULL,
	"value" text NOT NULL,
	"updatedBy" integer NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "siteText_textKey_unique" UNIQUE("textKey")
);
--> statement-breakpoint
CREATE TABLE "siteUpdates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(160) NOT NULL,
	"body" text NOT NULL,
	"linkLabel" varchar(80),
	"linkHref" varchar(512),
	"status" "publish_status" DEFAULT 'draft' NOT NULL,
	"authorId" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teamMembers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"role" varchar(160) NOT NULL,
	"bio" text,
	"imageUrl" varchar(512),
	"imageKey" varchar(512),
	"linkedinUrl" varchar(512),
	"instagramUrl" varchar(512),
	"facebookUrl" varchar(512),
	"tiktokUrl" varchar(512),
	"youtubeUrl" varchar(512),
	"websiteUrl" varchar(512),
	"position" integer DEFAULT 0 NOT NULL,
	"isPublished" boolean DEFAULT true NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(128) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "adminAccessRequests_status_requested_idx" ON "adminAccessRequests" USING btree ("status","requestedAt");--> statement-breakpoint
CREATE INDEX "adminInvites_status_idx" ON "adminInvites" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_public_starts_idx" ON "events" USING btree ("isPublished","startsAt");--> statement-breakpoint
CREATE INDEX "heroSlides_public_position_idx" ON "heroSlides" USING btree ("isPublished","position");--> statement-breakpoint
CREATE INDEX "impactMetrics_position_idx" ON "impactMetrics" USING btree ("position");--> statement-breakpoint
CREATE INDEX "serviceCards_position_idx" ON "serviceCards" USING btree ("position");--> statement-breakpoint
CREATE INDEX "siteText_key_idx" ON "siteText" USING btree ("textKey");--> statement-breakpoint
CREATE INDEX "siteUpdates_status_created_idx" ON "siteUpdates" USING btree ("status","createdAt");--> statement-breakpoint
CREATE INDEX "teamMembers_public_position_idx" ON "teamMembers" USING btree ("isPublished","position");
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "siteUpdates" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "heroSlides" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "impactMetrics" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "teamMembers" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "siteAppearance" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "siteText" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "serviceCards" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "adminInvites" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "adminAccessRequests" ENABLE ROW LEVEL SECURITY;
