import fs from "node:fs/promises";

const sourcePath = "/home/ubuntu/can-do-atl-transfer-content.json";
const source = JSON.parse(await fs.readFile(sourcePath, "utf8"));

const isLegacyMedia = (value) => typeof value === "string" && (value.startsWith("/manus-storage/") || value.includes("candocatl-udvzjxsy.manus.space/manus-storage/"));
const cleanUrl = (value, fallback = "") => isLegacyMedia(value) ? fallback : value;
const cleanKey = (url, key) => isLegacyMedia(url) ? null : key;

source.heroSlides = (source.heroSlides ?? []).map((row) => ({
  ...row,
  imageUrl: cleanUrl(row.imageUrl),
  imageKey: cleanKey(row.imageUrl, row.imageKey),
}));

source.teamMembers = (source.teamMembers ?? []).map((row) => ({
  ...row,
  imageUrl: cleanUrl(row.imageUrl, null),
  imageKey: cleanKey(row.imageUrl, row.imageKey),
}));

source.serviceCards = (source.serviceCards ?? []).map((row) => ({
  ...row,
  imageUrl: cleanUrl(row.imageUrl),
  imageKey: cleanKey(row.imageUrl, row.imageKey),
  hoverImageUrl: cleanUrl(row.hoverImageUrl),
  hoverImageKey: cleanKey(row.hoverImageUrl, row.hoverImageKey),
}));

source.siteAppearance = (source.siteAppearance ?? []).map((row) => ({
  ...row,
  logoUrl: cleanUrl(row.logoUrl),
  logoKey: cleanKey(row.logoUrl, row.logoKey),
  pageMode: isLegacyMedia(row.pageImageUrl) ? "solid" : row.pageMode,
  pageImageUrl: cleanUrl(row.pageImageUrl, null),
  pageImageKey: cleanKey(row.pageImageUrl, row.pageImageKey),
  headerMode: isLegacyMedia(row.headerImageUrl) ? "solid" : row.headerMode,
  headerImageUrl: cleanUrl(row.headerImageUrl, null),
  headerImageKey: cleanKey(row.headerImageUrl, row.headerImageKey),
  footerMode: isLegacyMedia(row.footerImageUrl) ? "gradient" : row.footerMode,
  footerImageUrl: cleanUrl(row.footerImageUrl, null),
  footerImageKey: cleanKey(row.footerImageUrl, row.footerImageKey),
}));

await fs.writeFile(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
console.log(`Sanitized legacy media references in ${sourcePath}`);
