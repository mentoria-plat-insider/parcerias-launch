import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import { adminAccessInput } from "./adminAccess";
import { matchesPendingAdminGrant } from "../db";
import type { TrpcContext } from "../_core/context";

const request = { protocol: "https", headers: {} } as TrpcContext["req"];
const response = { clearCookie: () => undefined } as TrpcContext["res"];

function contextFor(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? {
      id: 42,
      openId: `admin-access-test-${role}`,
      email: "teste@example.com",
      name: "Pessoa de teste",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } : null,
    req: request,
    res: response,
  };
}

describe("gestão de Administradores", () => {
  it("bloqueia a listagem de Administradores sem privilégio administrativo", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.adminAccess.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bloqueia a inclusão de Administradores sem sessão autenticada", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.adminAccess.add({ fullName: "Arthur Lobo", email: "arthur.lobo@grupoigd.com.br" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bloqueia a inclusão de Administradores por usuário autenticado sem papel admin", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.adminAccess.add({ fullName: "Arthur Lobo", email: "arthur.lobo@grupoigd.com.br" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bloqueia a revogação de Administradores por usuário autenticado sem papel admin", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.adminAccess.revoke({ grantId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("valida nome e e-mail antes da criação de um acesso administrativo", () => {
    expect(adminAccessInput.safeParse({ fullName: "Ar", email: "invalido" }).success).toBe(false);
    expect(adminAccessInput.safeParse({ fullName: "Arthur Lobo", email: "arthur.lobo@grupoigd.com.br" }).success).toBe(true);
  });

  it("ativa somente um convite pendente que corresponda ao e-mail autenticado", () => {
    expect(matchesPendingAdminGrant({ status: "pending", email: "arthur.lobo@grupoigd.com.br" }, " ARTHUR.LOBO@GRUPOIGD.COM.BR ")).toBe(true);
    expect(matchesPendingAdminGrant({ status: "active", email: "arthur.lobo@grupoigd.com.br" }, "arthur.lobo@grupoigd.com.br")).toBe(false);
    expect(matchesPendingAdminGrant({ status: "pending", email: "arthur.lobo@grupoigd.com.br" }, "outra.pessoa@grupoigd.com.br")).toBe(false);
  });
});
