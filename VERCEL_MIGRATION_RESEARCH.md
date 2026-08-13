# Vercel Migration Research Notes

## Official platform findings

Vercel supports both Vite front ends and Express back ends. A Vite project can deploy from a Git provider or the Vercel CLI, and Git-connected projects receive preview deployments for pull requests.[1] An Express application can run as a Vercel Function, but it is subject to Vercel Function limitations; in particular, `express.static()` is not a static-asset solution on Vercel.[2]

The current site’s uploaded images and relational content need independent storage services after leaving the managed environment. Vercel documents Blob as its large-file storage option and identifies Marketplace relational databases, including Postgres providers such as Neon and Supabase, for transactional application data.[3]

## Sources

[1]: https://vercel.com/docs/frameworks/frontend/vite "Vite on Vercel"
[2]: https://vercel.com/docs/frameworks/backend/express "Express on Vercel"
[3]: https://vercel.com/docs/storage "Vercel Storage overview"
