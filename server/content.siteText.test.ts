import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { SITE_TEXT_DEFAULTS } from "@shared/siteText";

const { upsertSiteText } = vi.hoisted(() => ({
  upsertSiteText: vi.fn(async () => undefined),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, upsertSiteText };
});

import { contentRouter } from "./routers/content";

function contextFor(email: string, role: "admin" | "user"): TrpcContext {
  return { user: { id: 88, openId: "site-text-test-user", name: "Site Text Test User", email, loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

const entries = Object.entries(SITE_TEXT_DEFAULTS).map(([textKey, value]) => ({ textKey, value }));

describe("content.updateSiteText", () => {
  it("allows an admitted administrator to save the complete public text catalog", async () => {
    upsertSiteText.mockClear();
    const caller = contentRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin"));
    await expect(caller.updateSiteText({ entries })).resolves.toBeUndefined();
    expect(upsertSiteText).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ textKey: "storyOneBody" })]), 88);
  });

  it("rejects a regular account before website wording can be changed", async () => {
    upsertSiteText.mockClear();
    const caller = contentRouter.createCaller(contextFor("student@example.com", "user"));
    await expect(caller.updateSiteText({ entries })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(upsertSiteText).not.toHaveBeenCalled();
  });
});
