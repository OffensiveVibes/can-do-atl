import app from "../../server/app";

/**
 * Vercel's catch-all Function preserves /api/trpc/<procedure>, allowing the
 * Express tRPC adapter mounted at /api/trpc to resolve the requested procedure.
 */
export default app;
