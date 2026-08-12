# QA Verification Notes

## 2026-08-12 — Staff front-end customization update

The public home and About pages were captured at desktop and 375 px mobile widths after the branding integration. Both pages rendered without layout overlap or TypeScript errors. The responsive header, logo lockups, carousel, service cards, staff sign-in footer control, and About profile cards remained visible and usable in the inspected layouts.

The new staff customization API was verified with automated authorization tests: an admitted administrator can save brand settings, and a regular account is rejected for appearance edits, service-card edits, and logo-upload attempts.

## 2026-08-12 — Website Text catalog

The restarted application successfully loaded the new `siteText` table and its default catalog. Desktop captures confirmed that the home-page hero and the About-page introduction render their catalog-backed defaults without a public loading or layout error.

An authenticated administrator opened the Website Text workspace and successfully saved its complete unchanged catalog; the database now contains all 41 text entries. An existing placeholder team profile was also opened and saved through the staff UI, returning the editor to its ready state. The public About page was then reloaded and displayed the persisted Website Text catalog and all three published profile slots.
