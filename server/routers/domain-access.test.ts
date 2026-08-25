import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const request = { protocol: "https", headers: {} } as TrpcContext["req"];
const response = { clearCookie: () => undefined } as TrpcContext["res"];

function contextFor(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role ? {
      id: 42,
      openId: `domain-test-${role}`,
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

describe("proteções dos fluxos operacionais", () => {
  it("não disponibiliza a triagem para participantes sem privilégio administrativo", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.projects.forAdmin()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("não permite agendar uma reunião sem privilégio administrativo", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.interests.schedule({ interestId: 1, scheduledFor: new Date(Date.now() + 60_000), location: "Mesa 1" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("reserva os procedimentos de operação demonstrativa para Administradores", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.projects.validationMine()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.projects.validationCatalog()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.interests.validationMineAsLauncher()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.interests.validationDeclare({ projectId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("exige sessão autenticada antes de declarar interesse em um projeto", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.interests.declare({ projectId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("recusa triagem sem os critérios obrigatórios de conferência", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.projects.review({ projectId: 1, decision: "eligible", observation: "Análise concluída", nicheReviewed: true, avatarReviewed: false, romaReviewed: true, maturityReviewed: true })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it.skipIf(!process.env.DATABASE_URL)("recusa pelo roteador um interesse administrativo fora do catálogo demonstrativo", async () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.interests.validationDeclare({ projectId: 999_999_999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
