# QA Verification Notes

## 2026-08-12 — Staff front-end customization update

The public home and About pages were captured at desktop and 375 px mobile widths after the branding integration. Both pages rendered without layout overlap or TypeScript errors. The responsive header, logo lockups, carousel, service cards, staff sign-in footer control, and About profile cards remained visible and usable in the inspected layouts.

The new staff customization API was verified with automated authorization tests: an admitted administrator can save brand settings, and a regular account is rejected for appearance edits, service-card edits, and logo-upload attempts.

## 2026-08-12 — Website Text catalog

The restarted application successfully loaded the new `siteText` table and its default catalog. Desktop captures confirmed that the home-page hero and the About-page introduction render their catalog-backed defaults without a public loading or layout error.

An authenticated administrator opened the Website Text workspace and successfully saved its complete unchanged catalog; the database now contains all 41 text entries. An existing placeholder team profile was also opened and saved through the staff UI, returning the editor to its ready state. The public About page was then reloaded and displayed the persisted Website Text catalog and all three published profile slots.

## 2026-08-12 — Profile ordering and administrator requests

An authenticated administrator workspace review confirmed the Team Profiles tab exposes drag handles plus dedicated up/down controls for all four current profiles. The Requests tab renders a distinct local review queue with clear approval semantics and no automatic email sending. The sign-in view now includes the required administrator-only guidance, a mailto path, and a local request form in the component implementation.

The profile-order controls were exercised through the authenticated staff workspace: Gaby Morales-Ozuna moved from fourth to third position, persisted, and was then returned to fourth. A fresh public About page load confirmed the restored public order as Rabiatou Ndiaye, Maryam Hassan Mohamed, Meron Cherecho, and Gaby Morales-Ozuna.

The sandbox session was then signed out and `/admin` was loaded unauthenticated. The page visibly rendered the administrator-only sign-in guidance, `candoatltm@gmail.com` mailto link, email field, optional note field, and local request submit control.
