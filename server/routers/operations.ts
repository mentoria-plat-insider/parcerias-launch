import { z } from "zod";
import { getEventSettings, getOperationalMetricsForAdmin, listAuditEventsForAdmin, updateEventSettings } from "../db";
import { adminProcedure, router } from "../_core/trpc";

const auditEventsInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
}).optional();

/** Leitura administrativa agregada; não expõe contatos nem metadados sensíveis dos eventos. */
export const operationsRouter = router({
  metrics: adminProcedure.query(() => getOperationalMetricsForAdmin()),
  settings: adminProcedure.query(() => getEventSettings()),
  updateSettings: adminProcedure.input(z.object({ registrationPhase: z.enum(["launcher_open", "expert_open", "closed"]), maxLaunchersPerRoom: z.number().int().min(1).max(1000) })).mutation(({ ctx, input }) => updateEventSettings({ ...input, updatedByUserId: ctx.user.id })),
  auditEvents: adminProcedure.input(auditEventsInput).query(({ input }) => listAuditEventsForAdmin(input?.limit ?? 50)),
});
