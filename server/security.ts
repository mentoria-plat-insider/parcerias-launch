import type { NextFunction, Request, Response, RequestHandler } from "express";

type HeaderMap = Record<string, string>;

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
  namespace: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export function buildContentSecurityPolicy(analyticsEndpoint?: string) {
  let analyticsOrigin: string | undefined;
  try {
    analyticsOrigin = analyticsEndpoint
      ? new URL(analyticsEndpoint).origin
      : undefined;
  } catch {
    analyticsOrigin = undefined;
  }
  const scriptSources = ["'self'", "'unsafe-inline'", analyticsOrigin]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function buildSecurityHeaders(options: {
  isProduction: boolean;
  analyticsEndpoint?: string;
}): HeaderMap {
  const headers: HeaderMap = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };

  if (options.isProduction) {
    headers["Content-Security-Policy"] = buildContentSecurityPolicy(
      options.analyticsEndpoint
    );
  }

  return headers;
}

export function securityHeaders(options: {
  isProduction: boolean;
  analyticsEndpoint?: string;
}): RequestHandler {
  const headers = buildSecurityHeaders(options);

  return (_req: Request, res: Response, next: NextFunction) => {
    for (const [name, value] of Object.entries(headers)) {
      res.setHeader(name, value);
    }
    next();
  };
}

export const noStoreApiResponses: RequestHandler = (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
};

function clientKey(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function createRateLimiter({
  maxRequests,
  windowMs,
  namespace,
}: RateLimitOptions): RequestHandler {
  const entries = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${namespace}:${clientKey(req)}`;
    const existing = entries.get(key);
    const entry =
      !existing || now >= existing.resetAt
        ? { count: 0, resetAt: now + windowMs }
        : existing;

    entry.count += 1;
    entries.set(key, entry);

    const remaining = Math.max(0, maxRequests - entry.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader("RateLimit-Policy", `${maxRequests};w=${Math.ceil(windowMs / 1000)}`);
    res.setHeader("RateLimit-Limit", String(maxRequests));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > maxRequests) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
}
