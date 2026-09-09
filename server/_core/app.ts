import "dotenv/config";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth.js";
import { registerStorageProxy } from "./storageProxy.js";
import { appRouter } from "../routers.js";
import { ensureOwnerAdmin } from "../db.js";
import { createContext } from "./context.js";
import {
  createRateLimiter,
  noStoreApiResponses,
  securityHeaders,
} from "../security.js";

let appPromise: Promise<Express> | null = null;

/**
 * Builds the Express app (API routes only — no static file serving or Vite
 * dev middleware, that is the caller's responsibility, see index.ts) once
 * and caches it, so serverless runtimes (Vercel) reuse the same instance
 * across warm invocations instead of re-registering middleware/routes on
 * every request. If building the app fails (e.g. transient DB connectivity
 * issue during cold start), the failed promise is NOT cached, so the next
 * request gets a fresh attempt instead of every future request crashing
 * forever.
 *
 * Deliberately has zero imports of "./vite" (or anything that pulls in the
 * `vite` package/plugins): this module is bundled as-is for the Vercel
 * serverless function, and any top-level `import` of a dev-only dependency
 * would be hoisted to the top of that bundle by ESM semantics and executed
 * unconditionally, even if only referenced behind an `if` branching on
 * NODE_ENV — crashing the function if that dependency isn't present in the
 * function's runtime.
 */
export function buildApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = createApp().catch(error => {
      appPromise = null;
      throw error;
    });
  }
  return appPromise;
}

async function createApp(): Promise<Express> {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  try {
    await ensureOwnerAdmin();
  } catch (error) {
    // Never let a DB/provisioning hiccup during cold start take the whole
    // app down — the owner-admin bootstrap will simply be retried later.
    console.error("[Bootstrap] ensureOwnerAdmin failed:", error);
  }
  app.use(
    securityHeaders({
      isProduction: process.env.NODE_ENV === "production",
      analyticsEndpoint: process.env.VITE_ANALYTICS_ENDPOINT,
    })
  );
  app.use("/api", noStoreApiResponses);
  app.use(
    "/api",
    createRateLimiter({
      namespace: "api",
      maxRequests: 120,
      windowMs: 60_000,
    })
  );
  app.use(
    "/api/oauth/callback",
    createRateLimiter({
      namespace: "oauth-callback",
      maxRequests: 20,
      windowMs: 5 * 60_000,
    })
  );
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
