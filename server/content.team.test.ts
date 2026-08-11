import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { createTeamMember } = vi.hoisted(() => ({
  createTeamMember: vi.fn(async () => undefined),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createTeamMember };
});

import { contentRouter } from "./routers/content";

function contextFor(email: string, role: "admin" | "user"): TrpcContext {
  return {
    user: { id: 42, openId: "team-test-user", name: "Team Test User", email, loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const profileInput = {
  name: "Team member slot 04",
  role: "Campus outreach lead",
  bio: "Editable team profile space.",
  imageUrl: "",
  imageKey: "",
  linkedinUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  websiteUrl: "",
  position: 3,
  isPublished: true,
};

describe("content.createTeamMember", () => {
  it("allows an admitted administrator to create a profile", async () => {
    createTeamMember.mockClear();
    const caller = contentRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin"));

    await expect(caller.createTeamMember(profileInput)).resolves.toBeUndefined();
    expect(createTeamMember).toHaveBeenCalledWith(expect.objectContaining({
      name: profileInput.name,
      role: profileInput.role,
      bio: profileInput.bio,
      position: profileInput.position,
      isPublished: true,
      createdBy: 42,
    }));
  });

  it("rejects regular users before profile data can be written", async () => {
    createTeamMember.mockClear();
    const caller = contentRouter.createCaller(contextFor("student@example.com", "user"));

    await expect(caller.createTeamMember(profileInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(createTeamMember).not.toHaveBeenCalled();
  });
});
