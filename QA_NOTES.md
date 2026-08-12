# QA Verification Notes

## 2026-08-12 — Staff front-end customization update

The public home and About pages were captured at desktop and 375 px mobile widths after the branding integration. Both pages rendered without layout overlap or TypeScript errors. The responsive header, logo lockups, carousel, service cards, staff sign-in footer control, and About profile cards remained visible and usable in the inspected layouts.

The new staff customization API was verified with automated authorization tests: an admitted administrator can save brand settings, and a regular account is rejected for appearance edits, service-card edits, and logo-upload attempts.
