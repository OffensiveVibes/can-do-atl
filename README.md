# Can Do ATL landing page

This repository contains a static React and Vite landing page for **Can Do ATL**. It uses responsive React components, locally managed UI dependencies, and the shared asset URLs embedded in `client/src/pages/Home.tsx`.

## Run locally

Install dependencies with `pnpm install`, then run `pnpm dev`. A production validation is available through `pnpm check && pnpm build`.

## Update the live links

All destinations intended for organization ownership are grouped near the top of `client/src/pages/Home.tsx`.

| Item | What to update |
| --- | --- |
| Social profiles | Replace each `href` in the `socialLinks` array with Can Do ATL's LinkedIn, TikTok, Instagram, Facebook, and YouTube URLs. |
| Volunteer action | Replace the `href="#contact"` value on the **Volunteer with us** link with the chosen volunteer form URL. |
| Donation action | Replace the `href="#contact"` value on the **Give essentials** link with the chosen donation page URL. |
| Events and impact | Update the `driveDates` and `impactStats` arrays as the organization publishes confirmed information. |

## GitHub handoff

The project is ready to be committed to a GitHub repository. From the project directory, initialize or connect your remote repository, then commit the source files.

```bash
git add .
git commit -m "Launch Can Do ATL landing page"
git branch -M main
git remote add origin https://github.com/your-account/your-repository.git
git push -u origin main
```

The five generated visual assets are referenced through durable project asset URLs so they work in this managed project without placing large media files in the source tree.
