import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { editorProcedure } from "./authorization";
import { router } from "./_core/trpc";
import type { TrpcContext } from "./_core/context";

const testRouter = router({
  editorOnly: editorProcedure.query(({ ctx }) => ({ id: ctx.user.id })),
});

function contextFor(email: string, role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-open-id",
      name: "Test User",
      email,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("editor-protected procedures", () => {
  it("rejects a signed-in user who is neither primary nor admitted", async () => {
    const caller = testRouter.createCaller(contextFor("student@example.com", "user"));
    await expect(caller.editorOnly()).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
  });

  it("allows the specified primary email and an admitted administrator", async () => {
    await expect(testRouter.createCaller(contextFor("candoatltm@gmail.com", "user")).editorOnly()).resolves.toEqual({ id: 42 });
    await expect(testRouter.createCaller(contextFor("invited@example.com", "admin")).editorOnly()).resolves.toEqual({ id: 42 });
  });
});
