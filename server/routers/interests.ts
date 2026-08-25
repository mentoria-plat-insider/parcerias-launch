import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createAuditLog, declareProjectInterest, declareValidationProjectInterest, findMeetingSchedulingConflict, getValidationParticipantUserId, listExpertInterests, listInterestsForAdmin, listLauncherInterests, listValidationExpertInterests, listValidationLauncherInterests, scheduleMeeting } from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { requireApprovedParticipation } from "./access";

const interestInput = z.object({ projectId: z.number().int().positive() });
const meetingInput = z.object({
  interestId: z.number().int().positive(),
  scheduledFor: z.date(),
  location: z.string().trim().min(2).max(180),
  resource: z.string().trim().min(2).max(120),
  durationMinutes: z.number().int().min(10).max(180),
  operationalNote: z.string().trim().max(2000).optional(),
});

export const interestsRouter = router({
  declare: protectedProcedure.input(interestInput).mutation(async ({ ctx, input }) => {
    await requireApprovedParticipation(ctx.user.id, "lancador");
    const interest = await declareProjectInterest({ userId: ctx.user.id, projectId: input.projectId });
    if (!interest) throw new TRPCError({ code: "NOT_FOUND", message: "Projeto elegível não encontrado." });
    await createAuditLog({ actorUserId: ctx.user.id, action: "interest.declared", entityType: "interest", entityId: String(interest.id), metadata: { projectId: input.projectId } });
    return interest;
  }),

  validationDeclare: adminProcedure.input(interestInput).mutation(async ({ ctx, input }) => {
    let userId: number;
    try {
      userId = await getValidationParticipantUserId("lancador");
    } catch {
      throw new TRPCError({ code: "NOT_FOUND", message: "Projeto demonstrativo elegível não encontrado." });
    }
    await requireApprovedParticipation(userId, "lancador");
    const interest = await declareValidationProjectInterest({ userId, projectId: input.projectId });
    if (!interest) throw new TRPCError({ code: "NOT_FOUND", message: "Projeto demonstrativo elegível não encontrado." });
    await createAuditLog({ actorUserId: ctx.user.id, action: "validation.interest.declared", entityType: "interest", entityId: String(interest.id), metadata: { projectId: input.projectId, validation: true } });
    return interest;
  }),

  mineAsLauncher: protectedProcedure.query(async ({ ctx }) => {
    await requireApprovedParticipation(ctx.user.id, "lancador");
    return listLauncherInterests(ctx.user.id);
  }),

  validationMineAsLauncher: adminProcedure.query(async () => {
    const userId = await getValidationParticipantUserId("lancador");
    await requireApprovedParticipation(userId, "lancador");
    return listValidationLauncherInterests();
  }),

  mineAsExpert: protectedProcedure.query(async ({ ctx }) => {
    await requireApprovedParticipation(ctx.user.id, "expert");
    return listExpertInterests(ctx.user.id);
  }),

  validationMineAsExpert: adminProcedure.query(async () => {
    const userId = await getValidationParticipantUserId("expert");
    await requireApprovedParticipation(userId, "expert");
    return listValidationExpertInterests();
  }),

  forAdmin: adminProcedure.query(() => listInterestsForAdmin()),

  schedule: adminProcedure.input(meetingInput).mutation(async ({ ctx, input }) => {
    if (input.scheduledFor.getTime() < Date.now()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "A reunião precisa ser agendada para uma data futura." });
    }
    const conflict = await findMeetingSchedulingConflict(input);
    if (conflict) {
      const messages = {
        resource: "O recurso físico escolhido já está ocupado nesse intervalo.",
        launcher: "O Lançador já possui outra reunião nesse intervalo.",
        expert: "O Expert já possui outra reunião nesse intervalo.",
      } as const;
      throw new TRPCError({ code: "CONFLICT", message: messages[conflict] });
    }
    const meeting = await scheduleMeeting({ ...input, scheduledByUserId: ctx.user.id });
    if (!meeting) throw new TRPCError({ code: "NOT_FOUND", message: "Interesse não encontrado." });
    await createAuditLog({ actorUserId: ctx.user.id, action: "meeting.scheduled", entityType: "meeting", entityId: String(meeting.id), metadata: { interestId: input.interestId, resource: input.resource, durationMinutes: input.durationMinutes } });
    return meeting;
  }),
});
