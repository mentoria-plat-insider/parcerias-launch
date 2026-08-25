import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
  buildSecurityHeaders,
  createRateLimiter,
  noStoreApiResponses,
} from "./security";

function createResponse() {
  const headers = new Map<string, string>();
  const response = {
    setHeader: vi.fn((name: string, value: string) => headers.set(name, value)),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  return { response: response as unknown as Response, headers };
}

function createRequest(ip = "203.0.113.50") {
  return {
    ip,
    socket: { remoteAddress: ip },
  } as unknown as Request;
}

describe("controles de segurança HTTP", () => {
  it("inclui os cabeçalhos de endurecimento e uma CSP restrita em produção", () => {
    const headers = buildSecurityHeaders({
      isProduction: true,
      analyticsEndpoint: "https://analytics.example.test",
    });

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headers["Content-Security-Policy"]).toContain(
      "https://analytics.example.test"
    );
  });

  it("mantém a CSP válida quando o endpoint de analytics não está configurado corretamente", () => {
    const headers = buildSecurityHeaders({
      isProduction: true,
      analyticsEndpoint: "configuração-inválida",
    });

    expect(headers["Content-Security-Policy"]).toContain("script-src 'self'");
  });

  it("impede o cache das respostas de API", () => {
    const { response, headers } = createResponse();
    const next = vi.fn();

    noStoreApiResponses(createRequest(), response, next);

    expect(headers.get("Cache-Control")).toBe("no-store");
    expect(next).toHaveBeenCalledOnce();
  });

  it("rejeita pedidos que excedem o limite de uma mesma origem", () => {
    const limiter = createRateLimiter({
      maxRequests: 2,
      windowMs: 60_000,
      namespace: "test",
    });
    const request = createRequest();
    const first = createResponse();
    const second = createResponse();
    const third = createResponse();
    const next = vi.fn();

    limiter(request, first.response, next);
    limiter(request, second.response, next);
    limiter(request, third.response, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(third.response.status).toHaveBeenCalledWith(429);
    expect(third.response.json).toHaveBeenCalledWith({
      error: "Too many requests. Please try again later.",
    });
    expect(third.headers.get("RateLimit-Remaining")).toBe("0");
  });
});
