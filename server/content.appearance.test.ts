import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { upsertSiteAppearance, upsertServiceCards } = vi.hoisted(() => ({
  upsertSiteAppearance: vi.fn(async () => undefined),
  upsertServiceCards: vi.fn(async () => undefined),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, upsertSiteAppearance, upsertServiceCards };
});

import { contentRouter } from "./routers/content";

function contextFor(email: string, role: "admin" | "user"): TrpcContext {
  return { user: { id: 71, openId: "appearance-test-user", name: "Appearance Test User", email, loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

const appearance = {
  pageMode: "solid" as const, pageColor: "#F7F3EB", pageGradientFrom: "#F7F3EB", pageGradientTo: "#E7EDE1", pageImageUrl: "", pageImageKey: "", pageImageBlur: 0, pageOverlayOpacity: 24,
  headerMode: "solid" as const, headerColor: "#F7F3EB", headerGradientFrom: "#F7F3EB", headerGradientTo: "#F7F3EB", headerImageUrl: "", headerImageKey: "", headerImageBlur: 0, headerOverlayOpacity: 8,
  footerMode: "solid" as const, footerColor: "#2C2C2C", footerGradientFrom: "#2C2C2C", footerGradientTo: "#3A5A40", footerImageUrl: "", footerImageKey: "", footerImageBlur: 0, footerOverlayOpacity: 36,
};
const cards = [
  { cardKey: "food_drives" as const, imageUrl: "/manus-storage/food.png", imageKey: "", hoverImageUrl: "/manus-storage/food-hover.png", hoverImageKey: "", imageAlt: "Food supplies", position: 0 },
  { cardKey: "clothing_closet" as const, imageUrl: "/manus-storage/clothes.png", imageKey: "", hoverImageUrl: "/manus-storage/clothes-hover.png", hoverImageKey: "", imageAlt: "Clothing donations", position: 1 },
  { cardKey: "community_outreach" as const, imageUrl: "/manus-storage/outreach.png", imageKey: "", hoverImageUrl: "/manus-storage/outreach-hover.png", hoverImageKey: "", imageAlt: "Outreach care kits", position: 2 },
];

describe("content visual settings", () => {
  it("allows an admitted administrator to save appearance and service-card settings", async () => {
    upsertSiteAppearance.mockClear(); upsertServiceCards.mockClear();
    const caller = contentRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin"));
    await expect(caller.updateAppearance(appearance)).resolves.toBeUndefined();
    await expect(caller.updateServiceCards({ cards })).resolves.toBeUndefined();
    expect(upsertSiteAppearance).toHaveBeenCalledWith(expect.objectContaining({ pageColor: "#F7F3EB" }), 71);
    expect(upsertServiceCards).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ cardKey: "food_drives" })]), 71);
  });

  it("accepts uploaded project paths for header and footer image modes", async () => {
    upsertSiteAppearance.mockClear();
    const caller = contentRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin"));
    await expect(caller.updateAppearance({
      ...appearance,
      headerMode: "image",
      headerImageUrl: "/manus-storage/header-background.png",
      footerMode: "image",
      footerImageUrl: "/manus-storage/footer-background.png",
    })).resolves.toBeUndefined();
    expect(upsertSiteAppearance).toHaveBeenCalledWith(expect.objectContaining({
      headerMode: "image",
      headerImageUrl: "/manus-storage/header-background.png",
      footerMode: "image",
      footerImageUrl: "/manus-storage/footer-background.png",
    }), 71);
  });

  it("rejects a regular account before visual settings can be changed", async () => {
    upsertSiteAppearance.mockClear(); upsertServiceCards.mockClear();
    const caller = contentRouter.createCaller(contextFor("student@example.com", "user"));
    await expect(caller.updateAppearance(appearance)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.updateServiceCards({ cards })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(upsertSiteAppearance).not.toHaveBeenCalled(); expect(upsertServiceCards).not.toHaveBeenCalled();
  });
});
