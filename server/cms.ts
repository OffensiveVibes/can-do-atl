export const PRIMARY_ADMIN_EMAIL = "candoatltm@gmail.com";

export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export function isPrimaryAdministrator(email: string | null | undefined) {
  return normalizeEmail(email) === PRIMARY_ADMIN_EMAIL;
}

export function canCreateStaffAccount(
  email: string | null | undefined,
  invitationStatus?: "pending" | "accepted" | "revoked" | null,
) {
  return isPrimaryAdministrator(email) || invitationStatus === "pending" || invitationStatus === "accepted";
}

export function isAllowedEditor(user: { email: string | null; role: "user" | "admin" } | null) {
  return Boolean(user && (isPrimaryAdministrator(user.email) || user.role === "admin"));
}
