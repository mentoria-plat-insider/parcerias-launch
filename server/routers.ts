import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { interestsRouter } from "./routers/interests.js";
import { adminAccessRouter } from "./routers/adminAccess.js";
import { projectsRouter } from "./routers/projects.js";
import { registrationRouter } from "./routers/registrations.js";
import { operationsRouter } from "./routers/operations.js";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  registration: registrationRouter,
  projects: projectsRouter,
  interests: interestsRouter,
  adminAccess: adminAccessRouter,
  operations: operationsRouter,
});

export type AppRouter = typeof appRouter;
