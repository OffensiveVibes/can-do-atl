import { describe, expect, it } from "vitest";
import { DEFAULT_TEAM_MEMBERS } from "./team";

describe("Can Do ATL team profile defaults", () => {
  it("provides three explicitly editable placeholder profile slots", () => {
    expect(DEFAULT_TEAM_MEMBERS).toHaveLength(3);
    expect(DEFAULT_TEAM_MEMBERS.every((member) => member.name.startsWith("Team member slot"))).toBe(true);
    expect(DEFAULT_TEAM_MEMBERS.every((member) => member.isPublished)).toBe(true);
  });
});
