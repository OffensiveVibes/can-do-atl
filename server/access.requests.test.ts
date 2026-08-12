import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { createOrRefreshAccessRequest, listAccessRequests, approveAccessRequest, denyAccessRequest } = vi.hoisted(() => ({
  createOrRefreshAccessRequest: vi.fn(async () => undefined),
  listAccessRequests: vi.fn(async () => []),
  approveAccessRequest: vi.fn(async () => undefined),
  denyAccessRequest: vi.fn(async () => undefined),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createOrRefreshAccessRequest, listAccessRequests, approveAccessRequest, denyAccessRequest };
});

import { accessRouter } from "./routers/content";

function contextFor(email: string | null, role: "admin" | "user"): TrpcContext {
  return { user: email ? { id: 91, openId: "request-test-user", name: "Request Test User", email, loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("local administrator requests", () => {
  it("allows an unauthenticated visitor to submit a local email request", async () => {
    createOrRefreshAccessRequest.mockClear();
    await expect(accessRouter.createCaller(contextFor(null, "user")).submitRequest({ email: "volunteer@example.edu", note: "I can help edit events." })).resolves.toEqual({ submitted: true });
    expect(createOrRefreshAccessRequest).toHaveBeenCalledWith("volunteer@example.edu", "I can help edit events.");
  });

  it("allows an admitted administrator to approve or deny requests", async () => {
    approveAccessRequest.mockClear(); denyAccessRequest.mockClear();
    const caller = accessRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin"));
    await expect(caller.approveRequest({ id: 4 })).resolves.toBeUndefined();
    await expect(caller.denyRequest({ id: 5 })).resolves.toBeUndefined();
    expect(approveAccessRequest).toHaveBeenCalledWith(4, 91);
    expect(denyAccessRequest).toHaveBeenCalledWith(5, 91);
  });

  it("rejects regular accounts from viewing or deciding access requests", async () => {
    const caller = accessRouter.createCaller(contextFor("student@example.com", "user"));
    await expect(caller.listRequests()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.approveRequest({ id: 4 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
