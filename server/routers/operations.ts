import { z } from "zod";
import { getOperationalMetricsForAdmin, listAuditEventsForAdmin } from "../db";
import { adminProcedure, router } from "../_core/trpc";

const auditEventsInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
}).optional();

/** Leitura administrativa agregada; não expõe contatos nem metadados sensíveis dos eventos. */
export const operationsRouter = router({
  metrics: adminProcedure.query(() => getOperationalMetricsForAdmin()),
  auditEvents: adminProcedure.input(auditEventsInput).query(({ input }) => listAuditEventsForAdmin(input?.limit ?? 50)),
});
