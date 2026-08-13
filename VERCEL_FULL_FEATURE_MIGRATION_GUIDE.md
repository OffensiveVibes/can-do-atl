# Can Do ATL: Full-Feature Vercel Migration Guide

**Author:** Manus AI  
**Prepared:** August 13, 2026  
**Purpose:** Move Can Do ATL from its current managed full-stack environment to a GitHub-owned project hosted on Vercel without losing the public site, staff workspace, editable text/design controls, team ordering, uploads, or local administrator-request workflow.

## Executive answer

**Yes, every current user-facing feature can operate on Vercel, but the project cannot be deployed there unchanged.** The React, TypeScript, Vite, Express, tRPC, Drizzle, and MySQL-style application logic is portable. The blockers are not programming-language issues; they are the current platform-bound services: Manus OAuth, managed database access, managed image storage, and the long-lived Express bootstrap.

> Keep the present site live during the migration. Build and test the Vercel version on a separate Git branch and Vercel preview deployment, then point the domain only after staff sign-in, uploads, and public content have passed acceptance testing.

| Current capability | Keep, replace, or change | Vercel-ready destination |
| --- | --- | --- |
| React + Vite public site | **Keep** | Vercel static build / CDN |
| TypeScript | **Keep** | Node.js TypeScript build; no language conversion is required |
| Express + tRPC API | **Keep, but adapt** | A Vercel Node Function exporting the Express application rather than starting a port listener |
| Manus OAuth staff sign-in | **Replace** | Supabase Auth (recommended) or another external identity provider |
| Invite list, access requests, site text, profiles, events, settings | **Move data** | Supabase Postgres, accessed through Drizzle PostgreSQL |
| Managed `/manus-storage/` uploads | **Replace** | Supabase Storage (recommended) or Vercel Blob |
| Manus Vite/runtime plugins | **Remove in the Vercel branch** | Standard Vite React configuration |

Vercel supports Vite projects, Git-driven preview deployments, and Express applications running as Vercel Functions.[1] [2] The existing `server.listen(...)` application entry point must be changed because Vercel invokes serverless functions per request rather than running this app as a continuously bound server.[3]

## Recommended target architecture

For the fewest vendor accounts and the clearest administration workflow, use **GitHub + Vercel + Supabase**.

| Service | Role | Why this fits Can Do ATL |
| --- | --- | --- |
| GitHub | Source ownership and change history | Your friend or organization owns the code; every push is traceable. |
| Vercel | Hosting, preview deployments, custom domain | Serves the Vite front end and runs the Express/tRPC API as functions. |
| Supabase Auth | Staff identities and secure sessions | Replaces Manus OAuth while retaining invite-only staff access. |
| Supabase Postgres | Database | Stores content, appearance settings, team order, invitations, and access requests. |
| Supabase Storage | Image files | Stores hero images, logos, profile photos, backgrounds, and card images. |

Vercel’s storage guidance identifies Marketplace relational databases such as Supabase and Blob storage for files. Supabase is recommended here because one project can cover the app’s relational data, staff authentication, and public-upload storage.[4]

## Before you start

The current live site should remain your production version until the new one is ready. Do not delete it, delete its storage files, or change the existing environment variables while the Vercel migration is in progress.

| Account or item | Who should own it | Why it is needed |
| --- | --- | --- |
| GitHub account or Can Do ATL GitHub organization | Your friend or Can Do ATL | Durable code ownership and access control. |
| Vercel account | The same owner or organization | Hosting, domains, environment variables, and deploy logs. |
| Supabase project | The same owner or organization | Auth, Postgres, and image storage. |
| A new `vercel-migration` Git branch | Repository owner | Safe testing before production. |
| Content and image inventory | Current primary administrator | Ensures page text, profiles, images, and staff access records move completely. |

## Step-by-step migration

### 1. Put the source under the organization’s GitHub ownership

Create a private GitHub repository called `can-do-atl`. Export or transfer the current source there, preserving the project history if possible. Add your friend as an **Owner** or **Admin** in GitHub, and protect the `main` branch so that changes are reviewed before publishing.

Then create a migration branch:

```bash
git checkout -b vercel-migration
git push -u origin vercel-migration
```

Vercel can connect to Git and create a preview deployment for branch changes, letting your team test without affecting production.[1]

### 2. Create the Supabase project

Create a new Supabase project in a region reasonably close to the primary audience and Vercel function region. In Supabase, record the following values securely:

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Server only | Postgres connection string used by Drizzle. |
| `VITE_SUPABASE_URL` | Browser-safe | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Browser-safe | Public Supabase client key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Administrative operations that must never run in the browser. |
| `SESSION_SECRET` | **Server only** | Only if retaining a custom server-side session wrapper. |

Do **not** put `SUPABASE_SERVICE_ROLE_KEY`, database passwords, or session secrets in `VITE_*` variables. Vite exposes `VITE_*` values to the browser bundle.

### 3. Move the schema from MySQL to Postgres

The current schema uses Drizzle’s MySQL definitions. In the Vercel migration branch, switch it to Drizzle PostgreSQL definitions and use a Postgres driver. The tables and features remain the same:

| Current table or data | Vercel/Supabase outcome |
| --- | --- |
| `users` | Auth-linked application user profile and role. |
| `adminInvites`, `adminAccessRequests` | Preserved exactly; they continue to govern local request review and the allow-list. |
| `heroSlides`, `events`, `siteUpdates`, `impactMetrics`, `teamMembers`, `siteText`, `siteAppearance`, `serviceCards` | Preserved as content tables. |
| Image URL and key columns | Updated to hold Supabase Storage public URLs or object keys. |

Run the generated Postgres migration only against the new Supabase project. Never run a new Postgres migration against the existing database.

### 4. Export and recreate application content

Because the current database and storage are managed by the existing platform, plan a controlled content transfer:

1. Record or export all staff-access rows, public text, design settings, events, slides, updates, impact metrics, team details, and current profile order.
2. Recreate that data in the new Supabase database through a one-time migration script or an administrator import screen.
3. Download and re-upload every currently managed image: logo, hero images, team photos, page/header/footer backgrounds, and service-card image pairs.
4. Replace old `/manus-storage/...` URLs with the new Supabase Storage URLs in the imported records.
5. Seed `candoatltm@gmail.com` as the initial administrator and carry forward any invited administrators that should remain active.

This deliberate transfer prevents the Vercel version from relying on the previous platform after launch.

### 5. Replace Manus OAuth with Supabase Auth

The current sign-in system uses Manus-specific OAuth endpoints and environment variables. Replace it with Supabase Auth using either Google sign-in, magic-link sign-in, or both. For a student-led organization, **magic links plus Google** are a practical default.

Retain the existing authorization model after sign-in:

1. The primary email `candoatltm@gmail.com` becomes the initial administrator.
2. A person submits an administrator request through the existing local form.
3. A current administrator approves it, creating an allow-list invitation.
4. The invited person signs in through Supabase with that exact email.
5. The application grants the `admin` role only after the invitation is activated.

Add the Vercel production domain and every Vercel preview URL pattern to Supabase Auth redirect settings before testing. This is essential for the staff sign-in callback.

### 6. Replace managed image storage

Replace `server/storage.ts` with a Supabase Storage helper. Create a public bucket such as `site-media` and preserve the current logical object prefixes:

```text
branding/
hero-slides/
team-members/
appearance/
service-cards/
```

All current uploaded images are intended for public website display, so a public bucket is appropriate. Restrict **writes** to authenticated administrators in your API; do not permit general browser uploads without a signed-upload policy. If you prefer Vercel-native media storage instead, Vercel Blob supports runtime image uploads and public or private access modes.[5]

### 7. Change the runtime adapter, not the application language

No rewrite to JavaScript, Python, or Next.js is required. Retain TypeScript, React, Vite, Express, and tRPC. In the Vercel branch:

1. Split the Express application construction from `server/_core/index.ts` into an exported `createApp()` function.
2. Remove `createServer(...)`, port discovery, and `server.listen(...)` from the Vercel entry point.
3. Add an `api/index.ts` Vercel Function that imports and exports the Express application.
4. Keep the tRPC mount at `/api/trpc`.
5. Let Vercel serve the Vite build; do not use `express.static()` as the production static-asset layer because Vercel’s Express guidance does not support it for this purpose.[2]
6. Remove `vite-plugin-manus-runtime`, the Manus debug collector, Manus OAuth routes, Manus storage proxy, and Manus-specific environment bindings from the migration branch.

### 8. Add Vercel project configuration

In Vercel, choose **Add New → Project**, import the GitHub repository, and select the `vercel-migration` branch for the first preview. Configure:

| Vercel setting | Value or action |
| --- | --- |
| Framework Preset | Vite, or **Other** if the project uses the custom API adapter configuration. |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | The Vercel-branch build command that produces the client bundle and function output. |
| Output directory | Vite output directory, typically `dist` or the configured static build output. |
| Node version | A currently supported Node LTS version compatible with the chosen database driver. |
| Environment Variables | Add the Supabase and session values from Step 2 in **Preview**, **Production**, and local Development as appropriate. |

Vercel environment variables are configured outside source code and are available at build time or function execution; changes apply to new deployments, not previous ones.[6]

### 9. Test the preview deployment before production

Use the preview URL to test each item below with real staff accounts and non-sensitive test content.

| Test area | Required result |
| --- | --- |
| Public pages | Home, About, website text, dynamic appearance, logo, carousel, events, updates, impact, and social links render. |
| Staff sign-in | Primary admin and an invited admin can sign in; non-admins remain blocked. |
| Requests | Public request saves locally; admin can approve or deny; approval adds the email to the allow-list. |
| Content management | Events, site updates, hero slides, website text, team profiles, profile order, and design settings save and reload. |
| Uploads | Logo, team photos, backgrounds, carousel images, and service-card images upload, display, and persist. |
| Security | No service-role key or database credential is present in browser JavaScript. |

### 10. Launch and attach the domain

After the preview passes the checklist, merge `vercel-migration` into `main`. Vercel will create a production deployment from the configured production branch. Then attach the new custom domain in Vercel, update the DNS records as instructed, and update the Supabase Auth redirect URLs to include the final domain.

Retain the former site temporarily as a rollback reference. Export a final backup of application data before switching DNS.

## What not to do

Do not deploy the current repository unchanged to Vercel and expect the full staff workspace to work. It will build the client, but staff authentication, managed image uploads, and the current server bootstrap are tied to the existing platform. Also, do not use GitHub Pages for the complete site; it cannot host the protected API, database, authentication, or uploads.

## Plan suitability

Vercel’s Hobby plan is free and aimed at personal projects and small-scale applications, but the official documentation restricts it to non-commercial, personal use.[7] Can Do ATL is a public, student-led organization with volunteer and support flows, so treat Hobby as a temporary prototype/testing option only. Before using Vercel for the organization’s long-term public site, review the current terms and choose the plan appropriate to the organization’s activity.

## Decision

Use **GitHub for ownership** and **Vercel for hosting** after the migration. The code language is already suitable: the project should remain TypeScript. The necessary work is a controlled replacement of identity, database, storage, and server bootstrap integrations—not a language rewrite.

## References

[1]: https://vercel.com/docs/frameworks/frontend/vite "Vite on Vercel"
[2]: https://vercel.com/docs/frameworks/backend/express "Express on Vercel"
[3]: https://vercel.com/docs/functions "Vercel Functions"
[4]: https://vercel.com/docs/storage "Vercel Storage overview"
[5]: https://vercel.com/docs/vercel-blob "Vercel Blob"
[6]: https://vercel.com/docs/environment-variables "Vercel environment variables"
[7]: https://vercel.com/docs/plans/hobby "Vercel Hobby Plan"
