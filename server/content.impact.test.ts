import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { upsertImpactMetrics } = vi.hoisted(() => ({
  upsertImpactMetrics: vi.fn(async () => undefined),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, upsertImpactMetrics };
});

import { contentRouter } from "./routers/content";

function contextFor(email: string, role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "impact-test-user",
      name: "Impact Test User",
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

const validMetrics = [
  { metricKey: "care_packages" as const, value: 10, label: "care packages shared", position: 0 },
  { metricKey: "clothing_items" as const, value: 20, label: "clothing items recirculated", position: 1 },
  { metricKey: "student_volunteers" as const, value: 5, label: "student volunteers", position: 2 },
];

describe("content.updateImpactMetrics", () => {
  it("lets an admitted administrator save all three verified counters", async () => {
    upsertImpactMetrics.mockClear();
    const caller = contentRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin"));

    await expect(caller.updateImpactMetrics({ metrics: validMetrics })).resolves.toBeUndefined();
    expect(upsertImpactMetrics).toHaveBeenCalledWith(validMetrics, 42);
  });

  it("rejects a regular signed-in user before any impact count can be changed", async () => {
    upsertImpactMetrics.mockClear();
    const caller = contentRouter.createCaller(contextFor("student@example.com", "user"));

    await expect(caller.updateImpactMetrics({ metrics: validMetrics })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(upsertImpactMetrics).not.toHaveBeenCalled();
  });
});
