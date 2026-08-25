import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useRegistration: vi.fn(),
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    registration: {
      mine: {
        useQuery: mocks.useRegistration,
      },
    },
  },
}));

vi.mock("@/const", () => ({
  startLogin: vi.fn(),
}));

import { AccessGate } from "../client/src/components/AccessGate";

function renderGate({
  requiredRole,
  authenticated = false,
  userRole = "user",
  allowAdminPreview = false,
}: {
  requiredRole: "admin" | "expert" | "lancador";
  authenticated?: boolean;
  userRole?: string;
  allowAdminPreview?: boolean;
}) {
  mocks.useAuth.mockReturnValue({
    user: authenticated ? { role: userRole } : null,
    loading: false,
    isAuthenticated: authenticated,
  });
  mocks.useRegistration.mockReturnValue({ data: null, isLoading: false });

  return renderToStaticMarkup(
    <AccessGate requiredRole={requiredRole} allowAdminPreview={allowAdminPreview}>
      <p>Conteúdo protegido de teste</p>
    </AccessGate>,
  );
}

describe("AccessGate renderizado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia a renderização dos três painéis sem sessão", () => {
    for (const requiredRole of ["admin", "expert", "lancador"] as const) {
      const html = renderGate({ requiredRole });
      expect(html).toContain("Acesso protegido");
      expect(html).not.toContain("Conteúdo protegido de teste");
    }
  });

  it("libera a rota de operação administrativa quando ela opta pelo modo administrativo", () => {
    const html = renderGate({
      requiredRole: "expert",
      authenticated: true,
      userRole: "admin",
      allowAdminPreview: true,
    });

    expect(html).toContain("Conteúdo protegido de teste");
    expect(html).not.toContain("Cadastro necessário");
  });
});
