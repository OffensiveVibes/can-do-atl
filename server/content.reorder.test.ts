import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { reorderTeamMembers } = vi.hoisted(() => ({ reorderTeamMembers: vi.fn(async () => undefined) }));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, reorderTeamMembers };
});

import { contentRouter } from "./routers/content";

function contextFor(email: string, role: "admin" | "user"): TrpcContext {
  return { user: { id: 73, openId: "reorder-test-user", name: "Reorder Test User", email, loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("content.reorderTeamMembers", () => {
  it("allows an admitted administrator to persist a complete ordered profile list", async () => {
    reorderTeamMembers.mockClear();
    await expect(contentRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin")).reorderTeamMembers({ ids: [3, 1, 2] })).resolves.toBeUndefined();
    expect(reorderTeamMembers).toHaveBeenCalledWith([3, 1, 2]);
  });

  it("rejects a regular signed-in account before it can reorder public profiles", async () => {
    reorderTeamMembers.mockClear();
    await expect(contentRouter.createCaller(contextFor("student@example.com", "user")).reorderTeamMembers({ ids: [3, 1, 2] })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(reorderTeamMembers).not.toHaveBeenCalled();
  });
});
