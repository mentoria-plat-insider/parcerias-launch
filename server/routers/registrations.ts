import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createAuditLog,
  getRegistrationByUserId,
  listAllRegistrations,
  listPendingRegistrations,
  submitRegistration,
  reviewRegistration,
} from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

export const registrationInput = z.object({
  requestedRole: z.enum(["expert", "lancador"]),
  fullName: z.string().trim().min(3).max(180),
  phone: z.string().trim().max(32).optional(),
  instagram: z.string().trim().max(120).optional(),
});

const reviewInput = z.object({
  registrationId: z.number().int().positive(),
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().min(3).max(2000),
});

export const registrationRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => {
    return getRegistrationByUserId(ctx.user.id);
  }),

  submit: protectedProcedure.input(registrationInput).mutation(async ({ ctx, input }) => {
    const current = await getRegistrationByUserId(ctx.user.id);

    if (current?.status === "approved") {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Seu cadastro já foi aprovado e não pode ser reenviado.",
      });
    }

    const registration = await submitRegistration({ userId: ctx.user.id, ...input });

    await createAuditLog({
      actorUserId: ctx.user.id,
      action: current ? "registration.resubmitted" : "registration.submitted",
      entityType: "registration",
      entityId: String(registration.id),
      metadata: { requestedRole: input.requestedRole },
    });

    return registration;
  }),

  pending: adminProcedure.query(async () => {
    return listPendingRegistrations();
  }),

  all: adminProcedure.query(async () => {
    return listAllRegistrations();
  }),

  review: adminProcedure.input(reviewInput).mutation(async ({ ctx, input }) => {
    const registration = await reviewRegistration({
      registrationId: input.registrationId,
      reviewerUserId: ctx.user.id,
      decision: input.decision,
      note: input.note,
    });

    if (!registration) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Cadastro não encontrado." });
    }

    await createAuditLog({
      actorUserId: ctx.user.id,
      action: `registration.${input.decision}`,
      entityType: "registration",
      entityId: String(registration.id),
      metadata: { requestedRole: registration.requestedRole, note: input.note },
    });

    return registration;
  }),
});
