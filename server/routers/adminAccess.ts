import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createAdminAccessGrant, listAdminAccessGrants, revokeAdminAccessGrant } from "../db";
import { adminProcedure, router } from "../_core/trpc";

export const adminAccessInput = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo.").max(180),
  email: z.string().trim().email("Informe um e-mail válido.").max(320),
});

export const adminAccessRouter = router({
  list: adminProcedure.query(() => listAdminAccessGrants()),

  add: adminProcedure.input(adminAccessInput).mutation(async ({ ctx, input }) => {
    return createAdminAccessGrant({
      ...input,
      createdByUserId: ctx.user.id,
    });
  }),

  revoke: adminProcedure.input(z.object({ grantId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const grants = await listAdminAccessGrants();
    const target = grants.find(item => item.grant.id === input.grantId);
    if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Administrador autorizado não encontrado." });
    if (target.grant.userId === ctx.user.id) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode revogar o seu próprio acesso administrativo." });
    }
    return revokeAdminAccessGrant({ grantId: input.grantId, revokedByUserId: ctx.user.id });
  }),
});
