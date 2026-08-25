import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import { totalPorStatus } from "../db";
import type { TrpcContext } from "../_core/context";

const request = { protocol: "https", headers: {} } as TrpcContext["req"];
const response = { clearCookie: () => undefined } as TrpcContext["res"];

function contextFor(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? {
      id: 99,
      openId: `operations-test-${role}`,
      email: "operacao@example.com",
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

describe("consulta operacional administrativa", () => {
  it("bloqueia indicadores para pessoas sem privilégio administrativo", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.operations.metrics()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bloqueia a trilha de auditoria sem sessão", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.operations.auditEvents({ limit: 50 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("mantém estados sem registros com valor zero nos indicadores", () => {
    expect(totalPorStatus([{ status: "approved", total: 2 }], ["pending", "approved", "rejected"])).toEqual({
      pending: 0,
      approved: 2,
      rejected: 0,
    });
  });
});
