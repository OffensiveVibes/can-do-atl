-- Run once in Supabase SQL Editor after the repaired Vercel preview is ready.
-- This does not delete the original Manus site or its files; it only removes
-- their URLs from the Vercel/Supabase migration database.

BEGIN;

UPDATE "teamMembers"
SET "imageUrl" = NULL, "imageKey" = NULL
WHERE "imageUrl" LIKE '%manus-storage%' OR "imageKey" IS NOT NULL;

UPDATE "serviceCards"
SET "imageUrl" = '', "imageKey" = NULL, "hoverImageUrl" = '', "hoverImageKey" = NULL
WHERE "imageUrl" LIKE '%manus-storage%'
   OR "hoverImageUrl" LIKE '%manus-storage%'
   OR "imageKey" IS NOT NULL
   OR "hoverImageKey" IS NOT NULL;

UPDATE "siteAppearance"
SET "logoUrl" = '', "logoKey" = NULL,
    "pageMode" = 'solid', "pageImageUrl" = NULL, "pageImageKey" = NULL, "pageImageBlur" = 0,
    "headerMode" = 'solid', "headerImageUrl" = NULL, "headerImageKey" = NULL, "headerImageBlur" = 0,
    "footerMode" = 'gradient', "footerImageUrl" = NULL, "footerImageKey" = NULL, "footerImageBlur" = 0
WHERE "logoUrl" LIKE '%manus-storage%'
   OR "pageImageUrl" LIKE '%manus-storage%'
   OR "headerImageUrl" LIKE '%manus-storage%'
   OR "footerImageUrl" LIKE '%manus-storage%'
   OR "logoKey" IS NOT NULL
   OR "pageImageKey" IS NOT NULL
   OR "headerImageKey" IS NOT NULL
   OR "footerImageKey" IS NOT NULL;

DELETE FROM "heroSlides" WHERE "imageUrl" LIKE '%manus-storage%' OR "imageKey" IS NOT NULL;

COMMIT;
