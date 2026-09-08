import "dotenv/config";
import express, { type Express } from "express";
import type { Server } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { ensureOwnerAdmin } from "../db";
import { createContext } from "./context";
import {
  createRateLimiter,
  noStoreApiResponses,
  securityHeaders,
} from "../security";

let appPromise: Promise<Express> | null = null;

/**
 * Builds the Express app once and caches it, so serverless runtimes
 * (Vercel) reuse the same instance across warm invocations instead of
 * re-registering middleware/routes on every request. If building the app
 * fails (e.g. transient DB connectivity issue during cold start), the
 * failed promise is NOT cached, so the next request gets a fresh attempt
 * instead of every future request crashing forever.
 */
export function buildApp(server?: Server): Promise<Express> {
  if (!appPromise) {
    appPromise = createApp(server).catch(error => {
      appPromise = null;
      throw error;
    });
  }
  return appPromise;
}

async function createApp(server?: Server): Promise<Express> {
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
  // In a serverless runtime (Vercel) there is no local build to serve and
  // no HMR dev server — only the API routes above are needed, static
  // assets are served by the platform's CDN/build output directly. The
  // `./vite` module (and its transitive `vite`/plugin dependencies) is only
  // imported here, lazily, so it never gets pulled into the serverless
  // function bundle.
  if (process.env.VERCEL) {
    return app;
  }
  const { serveStatic, setupVite } = await import("./vite");
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development" && server) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  return app;
}
