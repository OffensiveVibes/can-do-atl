# Can Do ATL: external handoff guide

This guide describes how to move ownership of Can Do ATL to a friend who does **not** use Manus. The recommended destination is **GitHub + Cloudflare Pages/Workers + Supabase**. The friend will manage code in GitHub, public hosting and DNS in Cloudflare, and content data, staff authentication, and uploads in Supabase.

> **Important:** the current application cannot be deployed unchanged to a static host. It uses the current project’s managed authentication, MySQL database, storage helpers, and Node/Express server. A migration must replace those services before Cloudflare deployment.

## 1. Put the code under the organization’s control

Create a GitHub organization or repository owned by Can Do ATL or the trusted friend, rather than by an individual developer. Export or push the current source repository to that owner. Make the `main` branch protected and invite at least two trusted maintainers.

```bash
git clone <THE-EXPORTED-REPOSITORY-URL>
cd can-do-atl
git remote set-url origin <THE-NEW-CAN-DO-ATL-GITHUB-REPOSITORY-URL>
git push -u origin main
```

The source repository contains the public pages, staff workspace, database schema, and a migration history. Do not copy `.env` files or publish secrets to GitHub.

## 2. Create a Supabase project owned by the friend

The new owner should create a Supabase account and a project using an organization-controlled email. Supabase provides Postgres, authentication, and storage in one project; it has official quickstarts for React and supports Auth plus storage-backed applications.[1]

Create these resources in Supabase:

| Resource | Purpose in Can Do ATL |
| --- | --- |
| Postgres database | Events, updates, carousel slides, impact metrics, team profiles, visual settings, and service-card images |
| Auth | Replaces the current managed staff login; use email magic links or Google sign-in |
| Storage bucket | Replaces current image uploads for carousel slides, team photos, background images, and service-card images |
| Row Level Security policies | Lets the public read published content while only approved staff can edit |

Re-create the current database schema as Postgres migrations, then export and import existing content records. Create a staff-roles table or a custom claim so `candoatltm@gmail.com` remains the primary administrator and invited staff remain explicitly allow-listed. Supabase Auth can be paired with database authorization through JWTs and Row Level Security policies.[2]

## 3. Convert the current server integration

Before deploying, replace the following integrations in code:

| Current integration | Cloudflare + Supabase replacement |
| --- | --- |
| Manus OAuth | Supabase Auth magic link, passwordless OTP, or Google sign-in |
| MySQL/Drizzle project database | Supabase Postgres with Postgres migrations and RLS policies |
| Managed storage upload helpers | Supabase Storage or a Cloudflare R2 bucket |
| Express/tRPC process | Cloudflare Worker endpoints, or direct Supabase client calls guarded by RLS |
| `manus-storage` asset paths | Supabase Storage public URLs or signed URLs |

Keep all staff-only mutations protected on the server or by Supabase RLS. Never place a service-role key in the frontend.

## 4. Create the Cloudflare project

After the migration build succeeds locally, the new owner should create a Cloudflare account and open **Workers & Pages → Create application → Pages → Connect to Git**. Select the Can Do ATL GitHub repository, configure the framework build details for the migrated app, and deploy. Cloudflare Pages can connect to a GitHub repository and deploy automatically whenever the selected branch receives a push.[3]

In the Cloudflare project settings, enter only the frontend-safe environment variables. Add private server-side keys through Cloudflare’s encrypted secret management rather than committing them to the repository.

## 5. Connect the new domain

Cloudflare Pages provides a `pages.dev` address while the new site is being tested. A custom domain must be purchased or provided by an organization, school, or existing registrar; the hosting address is free, but domain registration is normally separate.

For a custom domain, open the Pages project, select **Custom domains**, and choose **Set up a domain**. For an apex domain such as `candoatl.org`, move the domain’s nameservers to Cloudflare. For a subdomain such as `www.candoatl.org`, add the domain in the Pages dashboard first, then create the CNAME record Cloudflare specifies.[4]

## 6. Go-live checklist

Before publishing the new domain, the new owner should test the following items:

- The public home and About Us pages load from the new domain.
- Volunteer and essentials links still open the correct form and email action.
- A regular visitor cannot access `/admin` or modify data.
- `candoatltm@gmail.com` can sign in as the primary administrator.
- Invited staff can manage events, slides, team profiles, impact counts, backgrounds, and service-card images.
- Image uploads work and old image URLs have been replaced.
- All social links and the custom domain resolve correctly.

## 7. Suggested ownership setup

Give the friend ownership of the Cloudflare and Supabase projects, and give at least one Can Do ATL officer administrator access to both accounts. Store recovery codes, registrar access, and the Supabase project credentials in an organization-controlled password manager.

## References

[1]: https://supabase.com/docs/guides/getting-started "Supabase Getting Started"
[2]: https://supabase.com/docs/guides/auth "Supabase Auth"
[3]: https://developers.cloudflare.com/pages/configuration/git-integration/ "Cloudflare Pages Git integration"
[4]: https://developers.cloudflare.com/pages/configuration/custom-domains/ "Cloudflare Pages custom domains"
