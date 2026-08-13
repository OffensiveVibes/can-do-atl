import { COOKIE_NAME } from "@shared/const";
import { publicProcedure, router } from "./_core/trpc";
import { accessRouter, contentRouter } from "./routers/content";

export const appRouter = router({
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(() => {
      return { success: true } as const;
    }),
  }),
  content: contentRouter,
  access: accessRouter,
});

export type AppRouter = typeof appRouter;
