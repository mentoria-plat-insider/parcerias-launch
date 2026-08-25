export type AccessRole = "admin" | "expert" | "lancador";

export type AccessRegistration = {
  status: "pending" | "approved" | "rejected";
  requestedRole: Exclude<AccessRole, "admin">;
};

export type AccessGateDecision =
  | "allow"
  | "login-required"
  | "admin-only"
  | "registration-required"
  | "registration-pending"
  | "registration-rejected"
  | "role-mismatch";

export function resolveAccessGateDecision({
  isAuthenticated,
  userRole,
  requiredRole,
  allowAdminPreview = false,
  registration,
}: {
  isAuthenticated: boolean;
  userRole?: string | null;
  requiredRole: AccessRole;
  allowAdminPreview?: boolean;
  registration?: AccessRegistration | null;
}): AccessGateDecision {
  if (!isAuthenticated) return "login-required";

  if (requiredRole === "admin") {
    return userRole === "admin" ? "allow" : "admin-only";
  }

  if (allowAdminPreview && userRole === "admin") return "allow";
  if (!registration) return "registration-required";
  if (registration.status === "pending") return "registration-pending";
  if (registration.status === "rejected") return "registration-rejected";
  if (registration.requestedRole !== requiredRole) return "role-mismatch";

  return "allow";
}
