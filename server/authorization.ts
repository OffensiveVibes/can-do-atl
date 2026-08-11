import { TRPCError } from "@trpc/server";
import { isAllowedEditor, isPrimaryAdministrator } from "./cms";
import { protectedProcedure } from "./_core/trpc";

export const editorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isAllowedEditor(ctx.user)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Administrator access is required." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const primaryAdministratorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!isPrimaryAdministrator(ctx.user.email)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only the primary Can Do ATL administrator can manage access." });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
