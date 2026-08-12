import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { createTeamMember, updateTeamMember } = vi.hoisted(() => ({
  createTeamMember: vi.fn(async () => undefined),
  updateTeamMember: vi.fn(async () => undefined),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return { ...actual, createTeamMember, updateTeamMember };
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

  it("accepts an uploaded managed-storage image path when saving a profile", async () => {
    createTeamMember.mockClear();
    const caller = contentRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin"));
    await expect(caller.createTeamMember({
      ...profileInput,
      imageUrl: "/manus-storage/team-members/profile-photo.png",
      imageKey: "team-members/profile-photo.png",
    })).resolves.toBeUndefined();
    expect(createTeamMember).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: "/manus-storage/team-members/profile-photo.png" }));
  });

  it("updates an existing profile with an uploaded photo, bio, and complete social links", async () => {
    updateTeamMember.mockClear();
    const caller = contentRouter.createCaller(contextFor("mary2000skid@gmail.com", "admin"));
    const data = {
      ...profileInput,
      name: "Jordan Reed",
      bio: "Jordan coordinates campus clothing-closet volunteers and partner outreach.",
      imageUrl: "/manus-storage/team-members/jordan-reed.png",
      imageKey: "team-members/jordan-reed.png",
      linkedinUrl: "https://www.linkedin.com/in/jordan-reed",
      instagramUrl: "https://www.instagram.com/jordanreed",
      websiteUrl: "https://jordanreed.example",
    };
    await expect(caller.updateTeamMember({ id: 9, data })).resolves.toBeUndefined();
    expect(updateTeamMember).toHaveBeenCalledWith(9, expect.objectContaining({
      imageUrl: "/manus-storage/team-members/jordan-reed.png",
      bio: data.bio,
      linkedinUrl: data.linkedinUrl,
      websiteUrl: data.websiteUrl,
    }));
  });

  it("rejects regular users before profile data can be written", async () => {
    createTeamMember.mockClear();
    const caller = contentRouter.createCaller(contextFor("student@example.com", "user"));

    await expect(caller.createTeamMember(profileInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(createTeamMember).not.toHaveBeenCalled();
  });
});
