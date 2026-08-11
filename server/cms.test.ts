import { describe, expect, it } from "vitest";
import { isAllowedEditor, isPrimaryAdministrator, normalizeEmail } from "./cms";

describe("Can Do ATL administration access", () => {
  it("recognizes the primary administrator email regardless of casing", () => {
    expect(isPrimaryAdministrator("CANdoATLTM@gmail.com")).toBe(true);
    expect(normalizeEmail("  candoatltm@gmail.com ")).toBe("candoatltm@gmail.com");
  });

  it("denies a regular account and allows a primary or admitted administrator", () => {
    expect(isAllowedEditor({ email: "student@example.com", role: "user" })).toBe(false);
    expect(isAllowedEditor({ email: "candoatltm@gmail.com", role: "user" })).toBe(true);
    expect(isAllowedEditor({ email: "invited@example.com", role: "admin" })).toBe(true);
  });
});
