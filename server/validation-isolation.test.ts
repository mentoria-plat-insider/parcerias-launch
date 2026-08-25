import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { expertProfiles, projectInterests, projects, registrations, users } from "../drizzle/schema";
import { canDeclareValidationInterest, declareValidationProjectInterest, getDb, getProjectByExpertUserId, getValidationParticipantUserId, isValidationExpertOpenId, listValidationEligibleProjects, listValidationExpertInterests, listValidationLauncherInterests, saveProjectDraft, validationOpenIdByRole } from "../server/db";

describe("escopo dos dados demonstrativos", () => {
  it("mantém o modo operacional apontado apenas para os dois participantes fictícios identificados", () => {
    expect(validationOpenIdByRole).toEqual({
      expert: "demo-expert-validacao-01",
      lancador: "demo-lancador-validacao-01",
    });
    expect(Object.values(validationOpenIdByRole)).not.toContain("OWNER_OPEN_ID");
  });

  it("rejeita proprietários e projetos que não pertencem ao Expert demonstrativo", () => {
    const catalogoMisturado = [
      { projectId: 7, ownerOpenId: "demo-expert-validacao-01" },
      { projectId: 8, ownerOpenId: "participante-real-01" },
    ];
    const catalogoDemonstrativo = catalogoMisturado.filter(item => isValidationExpertOpenId(item.ownerOpenId));

    expect(catalogoDemonstrativo).toEqual([{ projectId: 7, ownerOpenId: "demo-expert-validacao-01" }]);
    expect(isValidationExpertOpenId("participante-real-01")).toBe(false);
    expect(isValidationExpertOpenId(null)).toBe(false);
    expect(canDeclareValidationInterest({ status: "eligible", ownerOpenId: "participante-real-01" })).toBe(false);
    expect(canDeclareValidationInterest({ status: "submitted", ownerOpenId: "demo-expert-validacao-01" })).toBe(false);
    expect(canDeclareValidationInterest({ status: "eligible", ownerOpenId: "demo-expert-validacao-01" })).toBe(true);
  });

  // A consulta resolve o participante, a inscrição e o perfil antes de ler o catálogo.
  // Em conexões remotas de banco isso pode ultrapassar o limite padrão de 5 segundos,
  // sem alterar a regra de isolamento que está sendo verificada.
  it("consulta o catálogo operacional exclusivamente no escopo do projeto demonstrativo", async () => {
    const catalogo = await listValidationEligibleProjects();
    expect(catalogo.every(({ project }) => project.name.includes("Validação"))).toBe(true);
  }, 15_000);

  it("consulta interesses e reuniões somente dentro do par demonstrativo", async () => {
    const [interessesDoLancador, interessesDoExpert] = await Promise.all([
      listValidationLauncherInterests(),
      listValidationExpertInterests(),
    ]);
    expect(interessesDoLancador.every(({ project }) => project.name.includes("Validação"))).toBe(true);
    expect(interessesDoExpert.every(({ project }) => project.name.includes("Validação"))).toBe(true);
  });

  it("rejeita a declaração demonstrativa para um projeto elegível real", async () => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível para o teste de isolamento.");
    const suffix = `fixture-isolamento-${Date.now()}`;
    let fixtureUserId: number | null = null;

    try {
      await db.insert(users).values({ openId: suffix, name: "Fixture de isolamento", loginMethod: "test", role: "user" });
      const [fixtureUser] = await db.select().from(users).where(eq(users.openId, suffix)).limit(1);
      if (!fixtureUser) throw new Error("Não foi possível criar a fixture de isolamento.");
      fixtureUserId = fixtureUser.id;

      await db.insert(registrations).values({ userId: fixtureUser.id, requestedRole: "expert", status: "approved", fullName: "Fixture de isolamento" });
      const [fixtureRegistration] = await db.select().from(registrations).where(eq(registrations.userId, fixtureUser.id)).limit(1);
      if (!fixtureRegistration) throw new Error("Não foi possível criar a inscrição da fixture.");

      await db.insert(expertProfiles).values({ userId: fixtureUser.id, registrationId: fixtureRegistration.id, generalSpecialties: [] });
      const [fixtureProfile] = await db.select().from(expertProfiles).where(eq(expertProfiles.userId, fixtureUser.id)).limit(1);
      if (!fixtureProfile) throw new Error("Não foi possível criar o perfil da fixture.");

      await db.insert(projects).values({
        expertProfileId: fixtureProfile.id,
        name: "Projeto real de isolamento",
        niche: "Teste",
        subniche: "Isolamento",
        specialties: [],
        maturity: "validated",
        avatarDescription: "Perfil de teste sem acesso ao ambiente demonstrativo.",
        pains: [],
        ambition: "Validar a proteção.",
        roma: "Transformação de teste.",
        mechanism: "Mecanismo de teste.",
        offerFormat: "Workshop",
        priceRange: "R$ 0",
        mainChannel: "Teste",
        primaryLink: "https://example.com/test",
        status: "eligible",
      });
      const [fixtureProject] = await db.select().from(projects).where(eq(projects.expertProfileId, fixtureProfile.id)).limit(1);
      if (!fixtureProject) throw new Error("Não foi possível criar o projeto da fixture.");

      const launcherUserId = await getValidationParticipantUserId("lancador");
      await expect(declareValidationProjectInterest({ userId: launcherUserId, projectId: fixtureProject.id })).resolves.toBeNull();
    } finally {
      if (fixtureUserId) await db.delete(users).where(eq(users.id, fixtureUserId));
    }
  });

  it("persiste edição e envio do Expert antes de registrar interesse do Lançador demonstrativo", async () => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível para o fluxo demonstrativo.");
    const expertUserId = await getValidationParticipantUserId("expert");
    const launcherUserId = await getValidationParticipantUserId("lancador");
    const original = await getProjectByExpertUserId(expertUserId);
    if (!original?.project) throw new Error("Projeto demonstrativo não encontrado.");
    const originalName = original.project.name;
    const originalStatus = original.project.status;
    const originalSubmittedAt = original.project.submittedAt;
    const editedName = `${originalName} — fluxo operacional`;
    let createdInterestId: number | null = null;

    try {
      const updated = await saveProjectDraft({ userId: expertUserId, fields: { name: editedName }, submit: true });
      expect(updated?.project?.name).toBe(editedName);
      expect(updated?.project?.status).toBe("submitted");

      await db.update(projects).set({ status: "eligible" }).where(eq(projects.id, original.project.id));
      const catalogo = await listValidationEligibleProjects();
      expect(catalogo.some(({ project }) => project.id === original.project!.id && project.name === editedName)).toBe(true);

      const interesse = await declareValidationProjectInterest({ userId: launcherUserId, projectId: original.project.id });
      expect(interesse?.projectId).toBe(original.project.id);
      createdInterestId = interesse?.id ?? null;
      const [persistedInterest] = await db.select().from(projectInterests).where(eq(projectInterests.id, interesse!.id)).limit(1);
      expect(persistedInterest?.projectId).toBe(original.project.id);
    } finally {
      if (createdInterestId) await db.delete(projectInterests).where(eq(projectInterests.id, createdInterestId));
      await db.update(projects).set({ name: originalName, status: originalStatus, submittedAt: originalSubmittedAt }).where(eq(projects.id, original.project.id));
    }
  });
});
