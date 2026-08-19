import fs from "node:fs/promises";

const source = JSON.parse(await fs.readFile("/home/ubuntu/can-do-atl-transfer-content.json", "utf8"));

const sql = [];
const escape = (value) => `'${String(value).replaceAll("'", "''")}'`;
const value = (input) => {
  if (input === null || input === undefined) return "NULL";
  if (typeof input === "boolean") return input ? "true" : "false";
  if (typeof input === "number") return String(input);
  return escape(input);
};
const statement = (table, columns, rows, conflictColumn) => {
  if (!rows.length) return;
  const values = rows.map((row) => `(${columns.map((column) => value(row[column])).join(", ")})`).join(",\n");
  const updates = columns.filter((column) => column !== conflictColumn && column !== "id").map((column) => `"${column}" = EXCLUDED."${column}"`).join(", ");
  sql.push(`INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(", ")}) VALUES\n${values}\nON CONFLICT ("${conflictColumn}") DO UPDATE SET ${updates};`);
};

sql.push("-- Can Do ATL Supabase preview seed — generated from sanitized managed content.");
sql.push("-- Image records are intentionally blank until staff uploads replacements to Supabase Storage.");

statement("impactMetrics", ["metricKey", "value", "label", "position", "updatedBy"], source.impactMetrics.map((row) => ({ ...row, updatedBy: 0 })), "metricKey");
statement("events", ["title", "campus", "details", "startsAt", "endsAt", "linkHref", "isPublished", "createdBy"], source.events.map((row) => ({ ...row, isPublished: Boolean(row.isPublished), createdBy: 0 })), "id");
statement("siteUpdates", ["title", "body", "linkLabel", "linkHref", "status", "authorId"], source.siteUpdates.map((row) => ({ ...row, authorId: 0 })), "id");
statement("heroSlides", ["eyebrow", "headline", "accent", "body", "imageUrl", "imageKey", "imageAlt", "volunteerHref", "donateHref", "position", "isPublished", "createdBy"], source.heroSlides.map((row) => ({ ...row, isPublished: Boolean(row.isPublished), createdBy: 0 })), "id");
statement("teamMembers", ["name", "role", "bio", "imageUrl", "imageKey", "linkedinUrl", "instagramUrl", "facebookUrl", "tiktokUrl", "youtubeUrl", "websiteUrl", "position", "isPublished", "createdBy"], source.teamMembers.map((row) => ({ ...row, isPublished: Boolean(row.isPublished), createdBy: 0 })), "id");
statement("siteText", ["textKey", "value", "updatedBy"], source.siteText.map((row) => ({ ...row, updatedBy: 0 })), "textKey");
statement("serviceCards", ["cardKey", "imageUrl", "imageKey", "hoverImageUrl", "hoverImageKey", "imageAlt", "position", "updatedBy"], source.serviceCards.map((row) => ({ ...row, updatedBy: 0 })), "cardKey");

if (source.siteAppearance[0]) {
  statement("siteAppearance", ["id", "siteName", "tabTitle", "logoUrl", "logoKey", "logoAlt", "primaryColor", "accentColor", "highlightColor", "inkColor", "buttonShape", "pageMode", "pageColor", "pageGradientFrom", "pageGradientTo", "pageImageUrl", "pageImageKey", "pageImageBlur", "pageOverlayOpacity", "headerMode", "headerColor", "headerGradientFrom", "headerGradientTo", "headerImageUrl", "headerImageKey", "headerImageBlur", "headerOverlayOpacity", "footerMode", "footerColor", "footerGradientFrom", "footerGradientTo", "footerImageUrl", "footerImageKey", "footerImageBlur", "footerOverlayOpacity", "updatedBy"], [{ ...source.siteAppearance[0], updatedBy: 0 }], "id");
}

statement("adminInvites", ["email", "status", "invitedBy"], [
  { email: "candoatltm@gmail.com", status: "pending", invitedBy: 0 },
  { email: "mary2000skid@gmail.com", status: "pending", invitedBy: 0 },
], "email");

await fs.writeFile("/home/ubuntu/can-do-atl-supabase-seed.sql", `${sql.join("\n\n")}\n`);
console.log("Created /home/ubuntu/can-do-atl-supabase-seed.sql from sanitized content.");
