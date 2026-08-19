# Can Do ATL implementation checklist

- [x] Create the branded visual asset set and upload it for web use.
- [x] Build the responsive landing page sections, interactions, and editable social-link placeholders.
- [x] Run the build and inspect desktop presentation.
- [x] Inspect mobile presentation after the visual refinement.
- [x] Package the raw source code for a GitHub handoff and provide usage notes.

## Administrator dashboard extension

- [x] Upgrade the project to use authenticated users and a secure content database.
- [x] Restrict administration to `candoatltm@gmail.com` and add an invite-only pathway for additional administrators.
- [x] Create a polished administration dashboard for updates, event dates, and hero carousel slides.
- [x] Implement a timed homepage hero carousel driven by administrator-managed content and images.
- [x] Verify public content displays correctly and administration routes reject unauthorized users.

## Social profile update

- [x] Replace footer social-link placeholders with Can Do ATL’s official profiles.
- [x] Verify the social destinations and document how the primary administrator signs in and edits site content.

## Conversion link update

- [x] Link every volunteer action to the supplied Google Form.
- [x] Link the public essentials-donation action to a pre-addressed email for Can Do ATL.

## Staff access update

- [x] Add a top-level Staff sign in action with a friendly smiley icon.
- [x] Clarify that `candoatltm@gmail.com` creates or activates the sole primary staff account, while added staff require a primary-admin invitation.
- [x] Let a signed-in non-invited user sign out from the invite-only screen and switch to the primary staff email.

## Inclusive carousel update

- [x] Generate and integrate multiple inclusive Can Do ATL volunteer illustrations as carousel starter slides.
- [x] Set the public hero carousel to advance through slides every four seconds.
- [x] Confirm administrators can upload and manage multiple carousel images from the staff workspace.

## Administrator access update

- [x] Add `mary2000skid@gmail.com` as an invited Can Do ATL administrator.

## Honest impact update

- [x] Replace mock impact figures with zeroed counts and a message inviting visitors to make the difference.

## Impact management dashboard

- [x] Add a secure database-backed model and protected API for the three public impact counters.
- [x] Add an Impact editor to the staff workspace and connect the public impact section to live values.
- [x] Verify authorized impact updates work and regular visitors cannot modify the counts.

## About Us and team profiles

- [x] Add a secure database-backed model and protected API for configurable team profiles and social links.
- [x] Build a public About Us page with responsive expandable member profile cards.
- [x] Add staff tools to create, edit, reorder, publish, and upload images for team profiles.
- [x] Seed three clearly marked placeholder profiles that administrators can replace.
- [x] Verify public profile expansion, optional administrator-supplied social-link rendering, and protected team management.

## Hosting handoff guidance

- [x] Document a no-cost hosting path and the migration requirements for handing the full-stack site to a non-Manus collaborator.

## Visual customization and handoff refinement

- [x] Move the public Staff sign in entry from the top of the homepage to the footer and verify it on the public page.
- [x] Add secure database-backed appearance settings for the page, header, and footer backgrounds, including colors, gradients, optional images, and image-overlay blur.
- [x] Add protected service-card settings for primary and hover images in the Care is practical section.
- [x] Add staff controls to upload and manage appearance backgrounds, overlay blur, and service-card images.
- [x] Improve responsive typography, word spacing, line height, and navigation spacing across public pages.
- [x] Add placeholder hover images for all three Care is practical cards.
- [x] Write a step-by-step Cloudflare + Supabase external handoff guide for a non-Manus collaborator.
- [x] Verify responsive layout, protected appearance APIs, and the Care is practical pointer-based image switch.

## Appearance editor repair and logo update

- [x] Diagnose and fix header and footer background-image upload, save, and display behavior.
- [x] Create and integrate a scalable Atlanta pencil and grocery-essentials logo mark.
- [x] Verify the repaired header/footer image settings and new logo across public pages.

## Logo selection and personal deployment guidance

- [x] Generate a varied set of selectable Can Do ATL logo concepts.
- [x] Document the practical Vercel and GitHub roles, compatibility limits, and recommended personal-project path.

## Staff front-end customization

- [x] Add a protected staff control to upload and change the public site logo and browser-tab icon.
- [x] Add practical, protected seasonal-style controls for public colors, button treatment, and text labels.
- [x] Verify the customization controls update public pages and reject non-administrator access.

## Website text and profile reliability

- [x] Add a protected Website Text workspace for the site’s fixed public wording and stories.
- [x] Connect editable website text fields to the public home and About pages.
- [x] Diagnose and repair team-profile create, update, link, bio, and image-save behavior.
- [x] Verify editable text and team profiles persist for administrators and remain protected from unauthorized accounts.
- [x] Add regression coverage for updating a profile with an uploaded image, bio, and valid social links.
- [x] Verify the protected Website Text and team-profile save flows through the available staff interface or authenticated integration path.

## Profile ordering and administrator requests

- [x] Add accessible drag-and-drop reordering for team profiles in the staff workspace.
- [x] Add a public local administrator-request form on the staff sign-in page with the required access guidance.
- [x] Add protected administrator controls to approve or deny local access requests and update the invite allow-list.
- [x] Verify ordering, request submission, staff decisions, and authorization protections.
- [x] Verify a reversible team-profile reorder through the authenticated staff UI and public About page.
- [x] Verify the unauthenticated sign-in guidance and public administrator-request form render correctly.

## Vercel migration assessment

- [x] Audit Manus-specific authentication, database, storage, and runtime dependencies against Vercel deployment requirements.
- [x] Write a step-by-step Vercel migration guide that preserves public content, staff management, uploads, and invite-only access.
- [x] Add source portability notes and validate the current project build before handing off the migration path.

## Vercel API packaging repair

- [x] Bundle the tRPC Express application with its server dependencies so the Vercel Function does not import unavailable source modules at runtime.
- [ ] Verify the repaired preview returns public team content and then investigate any remaining database or authorization error.

## Legacy-image handoff for Vercel migration

- [ ] Collect the current public image assets into a downloadable package for the Can Do ATL team.
- [ ] Remove legacy Manus managed-storage image URLs from the Vercel seed data so new Supabase uploads become the single image source.
- [ ] Provide simple instructions for re-uploading the images through the repaired Vercel staff workspace.
