import { decodeJwt } from "jose";
import { describe, expect, it } from "vitest";
import { SESSION_MAX_AGE_MS } from "../shared/const";
import { isSessionVersionCurrent, sdk } from "./_core/sdk";

describe("política de sessão", () => {
  it("emite tokens com duração padrão de doze horas", async () => {
    const token = await sdk.createSessionToken("session-policy-test", {
      name: "Session policy test",
    });
    const payload = decodeJwt(token);

    expect(payload.iat).toBeTypeOf("number");
    expect(payload.exp).toBeTypeOf("number");
    expect((payload.exp! - payload.iat!) * 1000).toBe(SESSION_MAX_AGE_MS);
  });

  it("incorpora a versão persistente ao token de sessão", async () => {
    const token = await sdk.createSessionToken("session-version-test", {
      name: "Session version test",
      sessionVersion: 4,
    });

    expect(decodeJwt(token).sessionVersion).toBe(4);
  });

  it("rejeita um token emitido antes da rotação da versão de sessão", () => {
    expect(isSessionVersionCurrent(4, 4)).toBe(true);
    expect(isSessionVersionCurrent(4, 5)).toBe(false);
  });

  it("exige nova autenticação após expiração, sem renovação silenciosa", async () => {
    const tokenExpirado = await sdk.createSessionToken("expired-session-test", {
      name: "Expired session test",
      expiresInMs: -1_000,
    });

    await expect(sdk.verifySession(tokenExpirado)).resolves.toBeNull();
  });
});
