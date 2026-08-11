import { describe, expect, it } from "vitest";
import { canCreateStaffAccount, isAllowedEditor, isPrimaryAdministrator, normalizeEmail } from "./cms";

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

  it("permits creation only for the primary email or an active invitation", () => {
    expect(canCreateStaffAccount("candoatltm@gmail.com", null)).toBe(true);
    expect(canCreateStaffAccount("invited@example.com", "pending")).toBe(true);
    expect(canCreateStaffAccount("revoked@example.com", "revoked")).toBe(false);
    expect(canCreateStaffAccount("uninvited@example.com", null)).toBe(false);
  });
});
