import { describe, expect, it } from "vitest";
import { resolveAccessGateDecision } from "../client/src/lib/accessGateDecision";

describe("resolveAccessGateDecision", () => {
  it("bloqueia todas as rotas protegidas quando não há sessão", () => {
    for (const requiredRole of ["admin", "expert", "lancador"] as const) {
      expect(resolveAccessGateDecision({ isAuthenticated: false, requiredRole })).toBe("login-required");
    }
  });

  it("permite apenas Administrador no painel administrativo", () => {
    expect(resolveAccessGateDecision({ isAuthenticated: true, userRole: "user", requiredRole: "admin" })).toBe("admin-only");
    expect(resolveAccessGateDecision({ isAuthenticated: true, userRole: "admin", requiredRole: "admin" })).toBe("allow");
  });

  it("libera a operação administrativa apenas quando a rota opta pelo modo administrativo", () => {
    expect(resolveAccessGateDecision({ isAuthenticated: true, userRole: "admin", requiredRole: "expert" })).toBe("registration-required");
    expect(resolveAccessGateDecision({ isAuthenticated: true, userRole: "admin", requiredRole: "expert", allowAdminPreview: true })).toBe("allow");
  });

  it("exige aprovação e respeita o perfil aprovado do participante", () => {
    expect(resolveAccessGateDecision({
      isAuthenticated: true,
      userRole: "user",
      requiredRole: "expert",
      registration: { status: "pending", requestedRole: "expert" },
    })).toBe("registration-pending");

    expect(resolveAccessGateDecision({
      isAuthenticated: true,
      userRole: "user",
      requiredRole: "expert",
      registration: { status: "approved", requestedRole: "lancador" },
    })).toBe("role-mismatch");

    expect(resolveAccessGateDecision({
      isAuthenticated: true,
      userRole: "user",
      requiredRole: "expert",
      registration: { status: "approved", requestedRole: "expert" },
    })).toBe("allow");
  });
});
