# Can Do ATL: GitHub and Vercel Personal-Project Guide

## The short answer

Use **GitHub for ownership and source control**. Use **Vercel for hosting** only after the project’s Manus-specific services have been migrated. GitHub alone does not run the website; it stores the code, tracks changes, and gives your friend a durable place to own the repository. Vercel can automatically deploy a GitHub repository whenever its `main` branch changes.[1]

For a **personal, non-commercial project**, Vercel’s free Hobby plan is an appropriate place to experiment. It is explicitly restricted to personal, non-commercial use, so it should be reviewed again before using it as the permanent platform for an operating organization.[2]

## What works and what must be migrated

| Current capability | GitHub | Vercel | Migration needed before a standalone external deployment |
| --- | --- | --- | --- |
| React and TypeScript interface | Stores the source | Hosts the build | No major change |
| Express and tRPC server | Stores the source | Can run Express as a Vercel Function | Adapt the current server entry point to Vercel’s deployment model |
| Staff sign-in | Stores the source | Can host an external auth integration | Replace Manus OAuth with Supabase Auth, Auth.js, Clerk, or another provider |
| Events, profiles, impact, and visual settings | Stores the schema and code | Connects to an external database | Move the current MySQL/TiDB data to a provider the new project owns |
| Uploaded images | Stores image references | Can use Vercel Blob or another storage provider | Replace the current managed project storage calls |

> The current app is not a static webpage. Do not use GitHub Pages for the full version, because it would not preserve the protected admin panel, database, sign-in flow, or uploads.

## Recommended ownership setup

Ask your friend to create a GitHub account, then create a **Can Do ATL GitHub organization** or a repository under the account that they control. Transfer or export the source repository to that owner before connecting Vercel. A Vercel project connected to GitHub deploys each push by default and can create preview deployments for changes before production.[1]

## Practical path for this personal project

1. Keep the current site live while the migration is prepared.
2. Export or transfer the source code to your friend’s GitHub repository.
3. Create a Vercel account using the same person’s GitHub account and import the repository.
4. Replace Manus OAuth, database, and storage with services owned by your friend or organization.
5. Add the new environment variables to Vercel and update the staff sign-in callback URL.
6. Test the admin dashboard, uploads, and background-image editor on a Vercel preview URL.
7. Attach a purchased domain when the migration is confirmed.

Vercel supports Express deployments, but its function and static-asset rules still need to be observed during the migration. In particular, Express static serving is not used in the usual way; static files should be handled through Vercel’s public asset flow.[3]

## Recommendation

For **learning, experiments, and a personal portfolio version**, use **GitHub + Vercel Hobby**. For the complete Can Do ATL organization site, first complete the migration described in `CLOUDFLARE_SUPABASE_HANDOFF.md` or create an equivalent Vercel-compatible replacement for authentication, database, and image storage. Once the organization begins operating publicly at scale, revisit the host’s terms and plan eligibility.

## References

[1]: https://vercel.com/docs/git/vercel-for-github "Vercel for GitHub"
[2]: https://vercel.com/docs/plans/hobby "Vercel Hobby Plan"
[3]: https://vercel.com/docs/frameworks/backend/express "Express on Vercel"
