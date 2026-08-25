import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import { registrationInput } from "./registrations";

const baseRequest = { protocol: "https", headers: {} } as TrpcContext["req"];
const baseResponse = { clearCookie: () => undefined } as TrpcContext["res"];

function contextFor(role: "admin" | "user" | null): TrpcContext {
  return {
    user: role
      ? {
          id: 22,
          openId: `test-${role}`,
          email: "test@example.com",
          name: "Pessoa de teste",
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null,
    req: baseRequest,
    res: baseResponse,
  };
}

describe("inscrições da Rodada de Parcerias", () => {
  it("rejeita uma inscrição sem sessão autenticada", async () => {
    const caller = appRouter.createCaller(contextFor(null));

    await expect(
      caller.registration.submit({ requestedRole: "expert", fullName: "Maria da Silva" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejeita a fila administrativa para uma conta sem papel de administrador", async () => {
    const caller = appRouter.createCaller(contextFor("user"));

    await expect(caller.registration.pending()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("impede payloads de inscrição fora das regras mínimas", () => {
    expect(() => registrationInput.parse({ requestedRole: "expert", fullName: "  " })).toThrow();
    expect(registrationInput.parse({ requestedRole: "lancador", fullName: "Lia Martins" })).toMatchObject({
      requestedRole: "lancador",
      fullName: "Lia Martins",
    });
  });
});
