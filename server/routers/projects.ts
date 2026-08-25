import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createAuditLog, getProjectByExpertUserId, getValidationParticipantUserId, listEligibleProjects, listProjectsForAdmin, listValidationEligibleProjects, reviewProject, saveProjectDraft } from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { requireApprovedParticipation } from "./access";

export const PROJECT_MATURITY_VALUES = ["structuring", "launched", "launched_validated"] as const;

export const projectFields = z.object({
  name: z.string().trim().min(3).max(180),
  niche: z.string().trim().min(2).max(180),
  subniche: z.string().trim().min(2).max(180),
  specialties: z.array(z.string().trim().min(2).max(80)).min(1).max(5),
  maturity: z.enum(PROJECT_MATURITY_VALUES),
  avatarDescription: z.string().trim().min(20).max(3000),
  pains: z.array(z.string().trim().min(2).max(240)).min(2).max(8),
  ambition: z.string().trim().min(10).max(2000),
  roma: z.string().trim().min(15).max(2000),
  mechanism: z.string().trim().min(3).max(600),
  offerFormat: z.string().trim().min(2).max(120),
  priceRange: z.string().trim().min(2).max(120),
  mainChannel: z.string().trim().min(2).max(180),
  primaryLink: z.string().trim().url().max(2048),
  evidence: z.string().trim().max(4000).optional(),
  internalNote: z.string().trim().max(4000).optional(),
  informationConfirmed: z.literal(true),
  curationAuthorized: z.literal(true),
  exposureAcknowledged: z.literal(true),
});

export const projectDraftFields = z.object({
  name: z.string().trim().max(180).optional(),
  niche: z.string().trim().max(180).optional(),
  subniche: z.string().trim().max(180).optional(),
  specialties: z.array(z.string().trim().max(80)).max(5).optional(),
  maturity: z.enum(PROJECT_MATURITY_VALUES).optional(),
  avatarDescription: z.string().trim().max(3000).optional(),
  pains: z.array(z.string().trim().max(240)).max(8).optional(),
  ambition: z.string().trim().max(2000).optional(),
  roma: z.string().trim().max(2000).optional(),
  mechanism: z.string().trim().max(600).optional(),
  offerFormat: z.string().trim().max(120).optional(),
  priceRange: z.string().trim().max(120).optional(),
  mainChannel: z.string().trim().max(180).optional(),
  primaryLink: z.string().trim().max(2048).optional(),
  evidence: z.string().trim().max(4000).optional(),
  internalNote: z.string().trim().max(4000).optional(),
  informationConfirmed: z.boolean().optional(),
  curationAuthorized: z.boolean().optional(),
  exposureAcknowledged: z.boolean().optional(),
});

const triageInput = z.object({
  projectId: z.number().int().positive(),
  decision: z.enum(["eligible", "not_eligible"]),
  observation: z.string().trim().min(3).max(4000),
  nicheReviewed: z.literal(true),
  avatarReviewed: z.literal(true),
  romaReviewed: z.literal(true),
  maturityReviewed: z.literal(true),
});

export const projectsRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => {
    await requireApprovedParticipation(ctx.user.id, "expert");
    return getProjectByExpertUserId(ctx.user.id);
  }),

  validationMine: adminProcedure.query(async () => {
    const userId = await getValidationParticipantUserId("expert");
    await requireApprovedParticipation(userId, "expert");
    return getProjectByExpertUserId(userId);
  }),

  saveDraft: protectedProcedure.input(projectDraftFields).mutation(async ({ ctx, input }) => {
    await requireApprovedParticipation(ctx.user.id, "expert");
    const saved = await saveProjectDraft({ userId: ctx.user.id, fields: input, submit: false });
    await createAuditLog({ actorUserId: ctx.user.id, action: "project.draft_saved", entityType: "project", entityId: String(saved?.project?.id ?? "new") });
    return saved;
  }),

  validationSaveDraft: adminProcedure.input(projectDraftFields).mutation(async ({ ctx, input }) => {
    const userId = await getValidationParticipantUserId("expert");
    await requireApprovedParticipation(userId, "expert");
    const saved = await saveProjectDraft({ userId, fields: input, submit: false });
    await createAuditLog({ actorUserId: ctx.user.id, action: "validation.project.draft_saved", entityType: "project", entityId: String(saved?.project?.id ?? "new"), metadata: { validation: true } });
    return saved;
  }),

  submit: protectedProcedure.input(projectFields).mutation(async ({ ctx, input }) => {
    await requireApprovedParticipation(ctx.user.id, "expert");
    if (["launched", "launched_validated"].includes(input.maturity) && !input.evidence) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Informe uma evidência para projetos já lançados." });
    }
    const saved = await saveProjectDraft({ userId: ctx.user.id, fields: input, submit: true });
    await createAuditLog({ actorUserId: ctx.user.id, action: "project.submitted", entityType: "project", entityId: String(saved?.project?.id ?? "new") });
    return saved;
  }),

  validationSubmit: adminProcedure.input(projectFields).mutation(async ({ ctx, input }) => {
    if (["launched", "launched_validated"].includes(input.maturity) && !input.evidence) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Informe uma evidência para projetos já lançados." });
    }
    const userId = await getValidationParticipantUserId("expert");
    await requireApprovedParticipation(userId, "expert");
    const saved = await saveProjectDraft({ userId, fields: input, submit: true });
    await createAuditLog({ actorUserId: ctx.user.id, action: "validation.project.submitted", entityType: "project", entityId: String(saved?.project?.id ?? "new"), metadata: { validation: true } });
    return saved;
  }),

  catalog: protectedProcedure.query(async ({ ctx }) => {
    await requireApprovedParticipation(ctx.user.id, "lancador");
    return listEligibleProjects();
  }),

  validationCatalog: adminProcedure.query(async () => {
    const userId = await getValidationParticipantUserId("lancador");
    await requireApprovedParticipation(userId, "lancador");
    return listValidationEligibleProjects();
  }),

  forAdmin: adminProcedure.query(() => listProjectsForAdmin()),

  review: adminProcedure.input(triageInput).mutation(async ({ ctx, input }) => {
    const project = await reviewProject({ ...input, reviewerUserId: ctx.user.id });
    if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Projeto não encontrado." });
    await createAuditLog({ actorUserId: ctx.user.id, action: `project.${input.decision}`, entityType: "project", entityId: String(project.id), metadata: { observation: input.observation } });
    return project;
  }),
});
