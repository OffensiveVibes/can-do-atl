import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { acceptInviteForUser, getUserByOpenId, upsertUser } from "../db";
import { getSupabaseIdentity } from "../supabase";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const authHeader = opts.req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) {
    try {
      const identity = await getSupabaseIdentity(token);
      if (identity?.email) {
        await upsertUser({
          openId: identity.id,
          email: identity.email,
          name: identity.user_metadata.full_name ?? identity.email,
          loginMethod: "supabase",
          lastSignedIn: new Date(),
        });
        user = await getUserByOpenId(identity.id) ?? null;
        if (user) {
          await acceptInviteForUser(identity.email, user.id);
          user = await getUserByOpenId(identity.id) ?? user;
        }
      }
    } catch {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
