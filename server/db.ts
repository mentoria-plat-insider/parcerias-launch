import { drizzle } from "drizzle-orm/mysql2";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import {
  adminAccessGrants,
  auditLogs,
  expertProfiles,
  eventSettings,
  InsertUser,
  launcherProfiles,
  meetings,
  projectInterests,
  projects,
  projectTriages,
  registrations,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export type EventRegistrationPhase = "launcher_open" | "expert_open" | "closed";

export async function getEventSettings() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [settings] = await db.select().from(eventSettings).limit(1);
  if (settings) return settings;
  const [created] = await db.insert(eventSettings).values({ registrationPhase: "launcher_open", maxLaunchersPerRoom: 10 }).$returningId();
  const [fallback] = await db.select().from(eventSettings).where(eq(eventSettings.id, created.id)).limit(1);
  return fallback!;
}

export async function updateEventSettings(input: { registrationPhase: EventRegistrationPhase; maxLaunchersPerRoom: number; updatedByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const current = await getEventSettings();
  await db.update(eventSettings).set(input).where(eq(eventSettings.id, current.id));
  return getEventSettings();
}

export async function getExpertFixedRoomForInterest(interestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [row] = await db.select({ fixedRoom: expertProfiles.fixedRoom }).from(projectInterests).innerJoin(projects, eq(projectInterests.projectId, projects.id)).innerJoin(expertProfiles, eq(projects.expertProfileId, expertProfiles.id)).where(eq(projectInterests.id, interestId)).limit(1);
  return row?.fixedRoom ?? null;
}

export async function countScheduledMeetingsForResource(resource: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [row] = await db.select({ total: sql<number>`count(*)` }).from(meetings).where(and(eq(meetings.resource, resource), eq(meetings.status, "scheduled")));
  return Number(row?.total ?? 0);
}

export async function setExpertFixedRoomForInterest(interestId: number, fixedRoom: string) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [row] = await db.select({ expertProfileId: projects.expertProfileId }).from(projectInterests).innerJoin(projects, eq(projectInterests.projectId, projects.id)).where(eq(projectInterests.id, interestId)).limit(1);
  if (row) await db.update(expertProfiles).set({ fixedRoom }).where(eq(expertProfiles.id, row.expertProfileId));
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/** Mantém a conta proprietária do projeto apta a operar o sistema desde o primeiro acesso. */
export async function ensureOwnerAdmin(): Promise<void> {
  if (!ENV.ownerOpenId) {
    console.warn("[Database] OWNER_OPEN_ID não disponível; administrador inicial não foi provisionado.");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Banco indisponível; administrador inicial será provisionado no primeiro login.");
    return;
  }

  await db.insert(users).values({
    openId: ENV.ownerOpenId,
    name: ENV.ownerName || null,
    loginMethod: "manus",
    role: "admin",
  }).onDuplicateKeyUpdate({
    set: { role: "admin" },
  });

  const owner = await getUserByOpenId(ENV.ownerOpenId);
  if (!owner?.email) return;

  await db.insert(adminAccessGrants).values({
    userId: owner.id,
    fullName: owner.name || ENV.ownerName || "Administrador inicial",
    email: owner.email.trim().toLowerCase(),
    status: "active",
    createdByUserId: owner.id,
    activatedAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: {
      userId: owner.id,
      fullName: owner.name || ENV.ownerName || "Administrador inicial",
      status: "active",
      activatedAt: new Date(),
      revokedAt: null,
    },
  });
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    const normalizedEmail = typeof user.email === "string" ? user.email.trim().toLowerCase() : null;
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    } else if (normalizedEmail) {
      const [grant] = await db.select().from(adminAccessGrants).where(and(
        eq(adminAccessGrants.email, normalizedEmail),
        eq(adminAccessGrants.status, "active"),
      )).limit(1);
      values.role = grant ? "admin" : "user";
      updateSet.role = grant ? "admin" : "user";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export function matchesPendingAdminGrant(grant: { email: string; status: string }, email: string | null | undefined) {
  return grant.status === "pending" && typeof email === "string" && grant.email === email.trim().toLowerCase();
}

async function activatePendingAdminGrant(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, user: { id: number; email: string | null }) {
  const normalizedEmail = user.email?.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const [pendingGrant] = await db.select().from(adminAccessGrants).where(and(
    eq(adminAccessGrants.email, normalizedEmail),
    eq(adminAccessGrants.status, "pending"),
  )).limit(1);
  if (!pendingGrant || !matchesPendingAdminGrant(pendingGrant, normalizedEmail)) return false;

  const activatedAt = new Date();
  await db.update(adminAccessGrants).set({
    userId: user.id,
    status: "active",
    activatedAt,
    revokedAt: null,
  }).where(eq(adminAccessGrants.id, pendingGrant.id));

  await createAuditLog({
    actorUserId: user.id,
    action: "admin_access_grant.activated",
    entityType: "adminAccessGrant",
    entityId: String(pendingGrant.id),
    metadata: { email: normalizedEmail, fullName: pendingGrant.fullName, status: "active", firstAccess: true },
  });
  return true;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  const user = result[0];
  if (!user) return undefined;

  await activatePendingAdminGrant(db, user);
  const normalizedEmail = user.email?.trim().toLowerCase();
  const [grant] = normalizedEmail ? await db.select().from(adminAccessGrants).where(and(
    eq(adminAccessGrants.email, normalizedEmail),
    eq(adminAccessGrants.status, "active"),
  )).limit(1) : [];
  const role: "admin" | "user" = user.openId === ENV.ownerOpenId || grant ? "admin" : "user";

  if (user.role !== role) {
    await db.update(users).set({ role }).where(eq(users.id, user.id));
  }
  if (grant && grant.userId !== user.id) {
    await db.update(adminAccessGrants).set({ userId: user.id, activatedAt: grant.activatedAt ?? new Date() }).where(eq(adminAccessGrants.id, grant.id));
  }

  return { ...user, role };
}

export type ValidationParticipantRole = "expert" | "lancador";

export const validationOpenIdByRole: Record<ValidationParticipantRole, string> = {
  expert: "demo-expert-validacao-01",
  lancador: "demo-lancador-validacao-01",
};

export function isValidationExpertOpenId(openId: string | null | undefined) {
  return typeof openId === "string" && (
    openId === validationOpenIdByRole.expert ||
    openId.startsWith("validation-expert-")
  );
}

export function canDeclareValidationInterest(project: { status: string; ownerOpenId: string | null | undefined }) {
  return project.status === "eligible" && isValidationExpertOpenId(project.ownerOpenId);
}

/** Resolve o participante fictício reservado exclusivamente para a validação administrativa. */
export async function getValidationParticipantUserId(role: ValidationParticipantRole) {
  const user = await getUserByOpenId(validationOpenIdByRole[role]);
  if (!user) throw new Error(`Participante demonstrativo de ${role} não encontrado.`);
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [registration] = await db.select().from(registrations).where(eq(registrations.userId, user.id)).limit(1);
  if (!registration || registration.status !== "approved") {
    throw new Error(`O cadastro demonstrativo de ${role} precisa estar aprovado para operar.`);
  }
  await ensureOperationalProfile(registration);
  return user.id;
}

export async function getRegistrationByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.userId, userId))
    .limit(1);

  return registration ?? null;
}

export async function submitRegistration(input: {
  userId: number;
  requestedRole: "expert" | "lancador";
  fullName: string;
  phone?: string;
  instagram?: string;
  leoaCompleted?: boolean;
  launchHistoryCount?: number;
  revenueLevel?: string;
  launchDuration?: string;
  mainDifficulties?: string;
  partnershipGoal: string;
  readinessReflection: string;
  termsAccepted: boolean;
  regulationAccepted: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const existing = await getRegistrationByUserId(input.userId);
  const values = {
    requestedRole: input.requestedRole,
    fullName: input.fullName,
    phone: input.phone || null,
    instagram: input.instagram || null,
    termsAcceptedAt: input.termsAccepted ? new Date() : null,
    regulationAcceptedAt: input.regulationAccepted ? new Date() : null,
    leoaCompleted: input.leoaCompleted ?? null,
    launchHistoryCount: input.launchHistoryCount ?? null,
    revenueLevel: input.revenueLevel || null,
    launchDuration: input.launchDuration || null,
    mainDifficulties: input.mainDifficulties || null,
    partnershipGoal: input.partnershipGoal,
    readinessReflection: input.readinessReflection,
    status: "pending" as const,
    approvedByUserId: null,
    reviewNote: null,
    reviewedAt: null,
  };

  if (existing) {
    await db.update(registrations).set(values).where(eq(registrations.id, existing.id));
  } else {
    await db.insert(registrations).values({ userId: input.userId, ...values });
  }

  const registration = await getRegistrationByUserId(input.userId);
  if (!registration) throw new Error("Não foi possível recuperar o cadastro salvo.");
  return registration;
}

export async function listPendingRegistrations() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  return db
    .select({ registration: registrations, user: users })
    .from(registrations)
    .innerJoin(users, eq(registrations.userId, users.id))
    .where(eq(registrations.status, "pending"))
    .orderBy(desc(registrations.createdAt));
}

export async function listAllRegistrations() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  return db
    .select({ registration: registrations, user: users })
    .from(registrations)
    .innerJoin(users, eq(registrations.userId, users.id))
    .orderBy(desc(registrations.createdAt));
}

export async function reviewRegistration(input: {
  registrationId: number;
  reviewerUserId: number;
  decision: "approved" | "rejected";
  note: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  await db
    .update(registrations)
    .set({
      status: input.decision,
      approvedByUserId: input.reviewerUserId,
      reviewNote: input.note,
      reviewedAt: new Date(),
    })
    .where(eq(registrations.id, input.registrationId));

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, input.registrationId))
    .limit(1);

  if (registration?.status === "approved") {
    await ensureOperationalProfile(registration);
  }

  return registration ?? null;
}

async function ensureOperationalProfile(registration: {
  id: number;
  userId: number;
  requestedRole: "expert" | "lancador";
  fullName: string;
  instagram: string | null;
  leoaCompleted: boolean | null;
  launchHistoryCount: number | null;
  revenueLevel: string | null;
  launchDuration: string | null;
  mainDifficulties: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  if (registration.requestedRole === "expert") {
    const [existing] = await db.select({ id: expertProfiles.id }).from(expertProfiles).where(eq(expertProfiles.userId, registration.userId)).limit(1);
    if (!existing) {
      await db.insert(expertProfiles).values({
        userId: registration.userId,
        registrationId: registration.id,
        headline: null,
        bio: null,
        instagram: registration.instagram,
        generalSpecialties: [],
        launchHistoryCount: 0,
      });
    }
    return;
  }

  const [existing] = await db.select({ id: launcherProfiles.id }).from(launcherProfiles).where(eq(launcherProfiles.userId, registration.userId)).limit(1);
  if (!existing) {
    await db.insert(launcherProfiles).values({
      userId: registration.userId,
      registrationId: registration.id,
      headline: null,
      bio: null,
      instagram: registration.instagram,
      leoaCompleted: registration.leoaCompleted ?? false,
      launchHistoryCount: registration.launchHistoryCount ?? 0,
      revenueLevel: registration.revenueLevel,
      launchDuration: registration.launchDuration,
      mainDifficulties: registration.mainDifficulties,
      niche: "A definir",
      audienceDescription: "A definir",
      stage: "starting",
    });
  }
}

export async function getExpertProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [profile] = await db.select().from(expertProfiles).where(eq(expertProfiles.userId, userId)).limit(1);
  return profile ?? null;
}

export async function getLauncherProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const [profile] = await db.select().from(launcherProfiles).where(eq(launcherProfiles.userId, userId)).limit(1);
  return profile ?? null;
}

type ProjectDraft = {
  name?: string;
  niche?: string;
  subniche?: string;
  specialties?: string[];
  maturity?: "structuring" | "checked_up" | "launched" | "launched_validated";
  avatarDescription?: string;
  pains?: string[];
  ambition?: string;
  roma?: string;
  mechanism?: string;
  offerFormat?: string;
  priceRange?: string;
  mainChannel?: string;
  primaryLink?: string;
  evidence?: string | null;
  internalNote?: string | null;
  informationConfirmed?: boolean;
  curationAuthorized?: boolean;
  exposureAcknowledged?: boolean;
};

const projectFallback = {
  name: "Rascunho sem título",
  niche: "A definir",
  subniche: "A definir",
  specialties: [] as string[],
  maturity: "structuring" as const,
  avatarDescription: "A definir",
  pains: [] as string[],
  ambition: "A definir",
  roma: "A definir",
  mechanism: "A definir",
  offerFormat: "A definir",
  priceRange: "A definir",
  mainChannel: "A definir",
  primaryLink: "https://exemplo.com",
  evidence: null,
  internalNote: null,
  informationConfirmed: false,
  curationAuthorized: false,
  exposureAcknowledged: false,
};

export async function getProjectByExpertUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const profile = await getExpertProfileByUserId(userId);
  if (!profile) return null;
  const [project] = await db.select().from(projects).where(eq(projects.expertProfileId, profile.id)).limit(1);
  return project ? { profile, project } : { profile, project: null };
}

export async function saveProjectDraft(input: { userId: number; fields: ProjectDraft; submit: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const profile = await getExpertProfileByUserId(input.userId);
  if (!profile) throw new Error("Perfil de Expert não encontrado.");

  const [existing] = await db.select().from(projects).where(eq(projects.expertProfileId, profile.id)).limit(1);
  const source = existing ?? projectFallback;
  const values = {
    name: input.fields.name ?? source.name,
    niche: input.fields.niche ?? source.niche,
    subniche: input.fields.subniche ?? source.subniche,
    specialties: input.fields.specialties ?? source.specialties,
    maturity: input.fields.maturity ?? source.maturity,
    avatarDescription: input.fields.avatarDescription ?? source.avatarDescription,
    pains: input.fields.pains ?? source.pains,
    ambition: input.fields.ambition ?? source.ambition,
    roma: input.fields.roma ?? source.roma,
    mechanism: input.fields.mechanism ?? source.mechanism,
    offerFormat: input.fields.offerFormat ?? source.offerFormat,
    priceRange: input.fields.priceRange ?? source.priceRange,
    mainChannel: input.fields.mainChannel ?? source.mainChannel,
    primaryLink: input.fields.primaryLink ?? source.primaryLink,
    evidence: input.fields.evidence ?? source.evidence,
    internalNote: input.fields.internalNote ?? source.internalNote,
    informationConfirmed: input.fields.informationConfirmed ?? source.informationConfirmed,
    curationAuthorized: input.fields.curationAuthorized ?? source.curationAuthorized,
    exposureAcknowledged: input.fields.exposureAcknowledged ?? source.exposureAcknowledged,
    status: input.submit ? "submitted" as const : (existing?.status === "eligible" || existing?.status === "not_eligible" ? existing.status : "draft" as const),
    submittedAt: input.submit ? new Date() : existing?.submittedAt ?? null,
  };

  if (existing) {
    await db.update(projects).set(values).where(eq(projects.id, existing.id));
  } else {
    await db.insert(projects).values({ expertProfileId: profile.id, ...values });
  }

  return getProjectByExpertUserId(input.userId);
}

export async function listEligibleProjects() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  return db
    .select({
      project: {
        id: projects.id,
        name: projects.name,
        niche: projects.niche,
        subniche: projects.subniche,
        specialties: projects.specialties,
        maturity: projects.maturity,
        avatarDescription: projects.avatarDescription,
        pains: projects.pains,
        ambition: projects.ambition,
        roma: projects.roma,
        mechanism: projects.mechanism,
        offerFormat: projects.offerFormat,
        priceRange: projects.priceRange,
        mainChannel: projects.mainChannel,
      },
    })
    .from(projects)
    .innerJoin(expertProfiles, eq(projects.expertProfileId, expertProfiles.id))
    .where(eq(projects.status, "eligible"))
    .orderBy(desc(projects.updatedAt));
}

/** Catálogo isolado para o ambiente de validação: somente projetos dos Experts fictícios. */
export async function listValidationEligibleProjects() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const rows = await db
    .select({
      project: {
        id: projects.id,
        name: projects.name,
        niche: projects.niche,
        subniche: projects.subniche,
        specialties: projects.specialties,
        maturity: projects.maturity,
        avatarDescription: projects.avatarDescription,
        pains: projects.pains,
        ambition: projects.ambition,
        roma: projects.roma,
        mechanism: projects.mechanism,
        offerFormat: projects.offerFormat,
        priceRange: projects.priceRange,
        mainChannel: projects.mainChannel,
      },
      ownerOpenId: users.openId,
    })
    .from(projects)
    .innerJoin(expertProfiles, eq(projects.expertProfileId, expertProfiles.id))
    .innerJoin(users, eq(expertProfiles.userId, users.id))
    .where(eq(projects.status, "eligible"))
    .orderBy(desc(projects.updatedAt));
  return rows
    .filter(row => isValidationExpertOpenId(row.ownerOpenId))
    .map(({ project }) => ({ project }));
}

export async function listProjectsForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  return db
    .select({ project: projects, expert: expertProfiles, registration: registrations, user: users })
    .from(projects)
    .innerJoin(expertProfiles, eq(projects.expertProfileId, expertProfiles.id))
    .innerJoin(registrations, eq(expertProfiles.registrationId, registrations.id))
    .innerJoin(users, eq(expertProfiles.userId, users.id))
    .orderBy(desc(projects.updatedAt));
}

export async function reviewProject(input: {
  projectId: number;
  reviewerUserId: number;
  decision: "eligible" | "not_eligible";
  observation: string;
  nicheReviewed: boolean;
  avatarReviewed: boolean;
  romaReviewed: boolean;
  maturityReviewed: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const [project] = await db.select().from(projects).where(eq(projects.id, input.projectId)).limit(1);
  if (!project) return null;

  await db.update(projects).set({ status: input.decision === "eligible" ? "eligible" : "not_eligible" }).where(eq(projects.id, input.projectId));
  await db.insert(projectTriages).values({
    projectId: input.projectId,
    reviewerUserId: input.reviewerUserId,
    decision: input.decision,
    observation: input.observation,
    nicheReviewed: input.nicheReviewed,
    avatarReviewed: input.avatarReviewed,
    romaReviewed: input.romaReviewed,
    maturityReviewed: input.maturityReviewed,
  });

  const [updated] = await db.select().from(projects).where(eq(projects.id, input.projectId)).limit(1);
  return updated ?? null;
}

export async function declareProjectInterest(input: { userId: number; projectId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const launcher = await getLauncherProfileByUserId(input.userId);
  if (!launcher) throw new Error("Perfil de Lançador não encontrado.");
  const [project] = await db.select().from(projects).where(and(eq(projects.id, input.projectId), eq(projects.status, "eligible"))).limit(1);
  if (!project) return null;

  const [existing] = await db
    .select()
    .from(projectInterests)
    .where(and(eq(projectInterests.projectId, input.projectId), eq(projectInterests.launcherProfileId, launcher.id)))
    .limit(1);
  if (existing) return existing;

  await db.insert(projectInterests).values({ projectId: input.projectId, launcherProfileId: launcher.id, status: "declared" });
  const [interest] = await db
    .select()
    .from(projectInterests)
    .where(and(eq(projectInterests.projectId, input.projectId), eq(projectInterests.launcherProfileId, launcher.id)))
    .limit(1);
  return interest ?? null;
}

/** Declara interesse somente se o projeto fizer parte do conjunto demonstrativo. */
export async function declareValidationProjectInterest(input: { userId: number; projectId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  // Valida a existência e o escopo do projeto antes de resolver as fixtures demonstrativas.
  // Isso mantém o contrato público do roteador: um projeto inexistente é NOT_FOUND,
  // mesmo quando o banco ainda não possui os participantes de validação provisionados.
  const [project] = await db
    .select({ id: projects.id, ownerOpenId: users.openId })
    .from(projects)
    .innerJoin(expertProfiles, eq(projects.expertProfileId, expertProfiles.id))
    .innerJoin(users, eq(expertProfiles.userId, users.id))
    .where(and(
      eq(projects.id, input.projectId),
      eq(projects.status, "eligible"),
    ))
    .limit(1);
  if (!project || !canDeclareValidationInterest({ status: "eligible", ownerOpenId: project.ownerOpenId })) return null;

  if (!isValidationExpertOpenId(project.ownerOpenId)) return null;
  return declareProjectInterest(input);
}

export async function listLauncherInterests(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const launcher = await getLauncherProfileByUserId(userId);
  if (!launcher) return [];
  return db
    .select({ interest: projectInterests, project: projects, meeting: meetings })
    .from(projectInterests)
    .innerJoin(projects, eq(projectInterests.projectId, projects.id))
    .leftJoin(meetings, eq(meetings.interestId, projectInterests.id))
    .where(eq(projectInterests.launcherProfileId, launcher.id))
    .orderBy(desc(projectInterests.createdAt));
}

export async function listLaunchersForExpertSelection(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const expert = await getExpertProfileByUserId(userId);
  if (!expert) return [];
  return db.select({ launcher: launcherProfiles, registration: registrations }).from(launcherProfiles).innerJoin(registrations, eq(launcherProfiles.registrationId, registrations.id)).where(eq(registrations.status, "approved")).orderBy(desc(launcherProfiles.createdAt));
}

export async function selectLauncherForProject(input: { expertUserId: number; launcherProfileId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const expert = await getExpertProfileByUserId(input.expertUserId);
  if (!expert) return null;
  const [project] = await db.select().from(projects).where(eq(projects.expertProfileId, expert.id)).limit(1);
  if (!project) return null;
  const [launcher] = await db.select().from(launcherProfiles).innerJoin(registrations, eq(launcherProfiles.registrationId, registrations.id)).where(and(eq(launcherProfiles.id, input.launcherProfileId), eq(registrations.status, "approved"))).limit(1);
  if (!launcher) return null;
  const [existing] = await db.select().from(projectInterests).where(and(eq(projectInterests.projectId, project.id), eq(projectInterests.launcherProfileId, input.launcherProfileId))).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(projectInterests).values({ projectId: project.id, launcherProfileId: input.launcherProfileId, status: "requested" }).$returningId();
  const [interest] = await db.select().from(projectInterests).where(eq(projectInterests.id, created.id)).limit(1);
  return interest ?? null;
}

export async function listExpertInterests(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const expert = await getExpertProfileByUserId(userId);
  if (!expert) return [];
  return db
    .select({ interest: projectInterests, project: projects, launcher: launcherProfiles, registration: registrations, meeting: meetings })
    .from(projectInterests)
    .innerJoin(projects, eq(projectInterests.projectId, projects.id))
    .innerJoin(launcherProfiles, eq(projectInterests.launcherProfileId, launcherProfiles.id))
    .innerJoin(registrations, eq(launcherProfiles.registrationId, registrations.id))
    .leftJoin(meetings, eq(meetings.interestId, projectInterests.id))
    .where(eq(projects.expertProfileId, expert.id))
    .orderBy(desc(projectInterests.createdAt));
}

export async function listInterestsForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  return db
    .select({ interest: projectInterests, project: projects, launcher: launcherProfiles, registration: registrations, meeting: meetings })
    .from(projectInterests)
    .innerJoin(projects, eq(projectInterests.projectId, projects.id))
    .innerJoin(launcherProfiles, eq(projectInterests.launcherProfileId, launcherProfiles.id))
    .innerJoin(registrations, eq(launcherProfiles.registrationId, registrations.id))
    .leftJoin(meetings, eq(meetings.interestId, projectInterests.id))
    .orderBy(desc(projectInterests.createdAt));
}

export type MeetingConflictKind = "resource" | "launcher" | "expert";

type ScheduledMeetingCandidate = {
  meeting: { scheduledFor: Date; durationMinutes: number; resource: string };
  launcherProfileId: number;
  expertProfileId: number;
};

export function rangesOverlap(startA: Date, durationA: number, startB: Date, durationB: number) {
  const endA = startA.getTime() + durationA * 60_000;
  const endB = startB.getTime() + durationB * 60_000;
  return startA.getTime() < endB && startB.getTime() < endA;
}

export function identifyMeetingSchedulingConflict(
  input: { scheduledFor: Date; durationMinutes: number; resource: string; launcherProfileId: number; expertProfileId: number },
  scheduled: ScheduledMeetingCandidate[],
): MeetingConflictKind | null {
  const normalizedResource = input.resource.trim().toLocaleLowerCase("pt-BR");
  for (const candidate of scheduled) {
    if (!rangesOverlap(input.scheduledFor, input.durationMinutes, candidate.meeting.scheduledFor, candidate.meeting.durationMinutes)) continue;
    if (candidate.meeting.resource.trim().toLocaleLowerCase("pt-BR") === normalizedResource) return "resource";
    if (candidate.launcherProfileId === input.launcherProfileId) return "launcher";
    if (candidate.expertProfileId === input.expertProfileId) return "expert";
  }
  return null;
}

/** Retorna o primeiro conflito operacional sem revelar a identidade de outros participantes. */
export async function findMeetingSchedulingConflict(input: { interestId: number; scheduledFor: Date; durationMinutes: number; resource: string }): Promise<MeetingConflictKind | null> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const [target] = await db
    .select({ launcherProfileId: projectInterests.launcherProfileId, expertProfileId: projects.expertProfileId })
    .from(projectInterests)
    .innerJoin(projects, eq(projectInterests.projectId, projects.id))
    .where(eq(projectInterests.id, input.interestId))
    .limit(1);
  if (!target) return null;

  const scheduled = await db
    .select({ meeting: meetings, launcherProfileId: projectInterests.launcherProfileId, expertProfileId: projects.expertProfileId })
    .from(meetings)
    .innerJoin(projectInterests, eq(meetings.interestId, projectInterests.id))
    .innerJoin(projects, eq(projectInterests.projectId, projects.id))
    .where(and(eq(meetings.status, "scheduled"), ne(meetings.interestId, input.interestId)));

  return identifyMeetingSchedulingConflict({ ...input, launcherProfileId: target.launcherProfileId, expertProfileId: target.expertProfileId }, scheduled);
}

export async function scheduleMeeting(input: { interestId: number; scheduledByUserId: number; scheduledFor: Date; location: string; resource: string; durationMinutes: number; operationalNote?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const [interest] = await db.select().from(projectInterests).where(eq(projectInterests.id, input.interestId)).limit(1);
  if (!interest) return null;
  const [existing] = await db.select().from(meetings).where(eq(meetings.interestId, input.interestId)).limit(1);
  const values = {
    scheduledByUserId: input.scheduledByUserId,
    scheduledFor: input.scheduledFor,
    location: input.location,
    resource: input.resource,
    durationMinutes: input.durationMinutes,
    operationalNote: input.operationalNote ?? null,
    status: "scheduled" as const,
  };
  if (existing) {
    await db.update(meetings).set(values).where(eq(meetings.id, existing.id));
  } else {
    await db.insert(meetings).values({ interestId: input.interestId, ...values });
  }
  await db.update(projectInterests).set({ status: "confirmed" }).where(eq(projectInterests.id, input.interestId));
  const [meeting] = await db.select().from(meetings).where(eq(meetings.interestId, input.interestId)).limit(1);
  return meeting ?? null;
}

export async function createAuditLog(input: {
  actorUserId: number | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  await db.insert(auditLogs).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
  });
}

type StatusCount = { status: string; total: number };

export function totalPorStatus(rows: StatusCount[], statuses: readonly string[]) {
  return Object.fromEntries(statuses.map(status => [status, Number(rows.find(row => row.status === status)?.total ?? 0)]));
}

/** Retorna somente contagens agregadas para a leitura operacional da Administração. */
export async function getOperationalMetricsForAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const [registrationRows, projectRows, interestRows, meetingRows, totalEventRows] = await Promise.all([
    db.select({ status: registrations.status, total: sql<number>`count(*)` }).from(registrations).groupBy(registrations.status),
    db.select({ status: projects.status, total: sql<number>`count(*)` }).from(projects).groupBy(projects.status),
    db.select({ status: projectInterests.status, total: sql<number>`count(*)` }).from(projectInterests).groupBy(projectInterests.status),
    db.select({ status: meetings.status, total: sql<number>`count(*)` }).from(meetings).groupBy(meetings.status),
    db.select({ total: sql<number>`count(*)` }).from(auditLogs),
  ]);

  return {
    registrations: totalPorStatus(registrationRows as StatusCount[], ["pending", "approved", "rejected"]),
    projects: totalPorStatus(projectRows as StatusCount[], ["draft", "submitted", "under_review", "eligible", "not_eligible"]),
    interests: totalPorStatus(interestRows as StatusCount[], ["declared", "requested", "confirmed", "closed"]),
    meetings: totalPorStatus(meetingRows as StatusCount[], ["scheduled", "completed", "cancelled"]),
    totalAuditEvents: Number(totalEventRows[0]?.total ?? 0),
  };
}

/** Não devolve metadados dos eventos para evitar que observações e contatos apareçam no painel de monitoramento. */
export async function listAuditEventsForAdmin(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorUserId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function listAdminAccessGrants() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  return db
    .select({ grant: adminAccessGrants, user: users })
    .from(adminAccessGrants)
    .leftJoin(users, eq(adminAccessGrants.userId, users.id))
    .orderBy(desc(adminAccessGrants.createdAt));
}

export async function createAdminAccessGrant(input: {
  fullName: string;
  email: string;
  createdByUserId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const [existing] = await db
    .select()
    .from(adminAccessGrants)
    .where(eq(adminAccessGrants.email, email))
    .limit(1);

  if (existing) return { grant: existing, created: false };

  await db.insert(adminAccessGrants).values({
    fullName,
    email,
    createdByUserId: input.createdByUserId,
    status: "pending",
  });

  const [grant] = await db
    .select()
    .from(adminAccessGrants)
    .where(eq(adminAccessGrants.email, email))
    .limit(1);
  if (!grant) throw new Error("Não foi possível registrar o Administrador autorizado.");

  await createAuditLog({
    actorUserId: input.createdByUserId,
    action: "admin_access_grant.created",
    entityType: "adminAccessGrant",
    entityId: String(grant.id),
    metadata: { email: grant.email, fullName: grant.fullName, status: grant.status },
  });

  return { grant, created: true };
}

export async function revokeAdminAccessGrant(input: { grantId: number; revokedByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");

  const [grant] = await db.select().from(adminAccessGrants).where(eq(adminAccessGrants.id, input.grantId)).limit(1);
  if (!grant) return null;

  await db
    .update(adminAccessGrants)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(eq(adminAccessGrants.id, input.grantId));

  if (grant.userId) {
    await db
      .update(users)
      .set({
        role: "user",
        sessionVersion: sql`${users.sessionVersion} + 1`,
      })
      .where(eq(users.id, grant.userId));
  }

  await createAuditLog({
    actorUserId: input.revokedByUserId,
    action: "admin_access_grant.revoked",
    entityType: "adminAccessGrant",
    entityId: String(input.grantId),
    metadata: { email: grant.email, fullName: grant.fullName, sessionInvalidated: Boolean(grant.userId) },
  });

  const [updated] = await db.select().from(adminAccessGrants).where(eq(adminAccessGrants.id, input.grantId)).limit(1);
  return updated ?? null;
}

/** Retorna apenas interesses do par fictício, para não expor dados reais à operação de validação. */
export async function listValidationLauncherInterests() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const expertUserId = await getValidationParticipantUserId("expert");
  const launcherUserId = await getValidationParticipantUserId("lancador");
  return db
    .select({ interest: projectInterests, project: projects, meeting: meetings })
    .from(projectInterests)
    .innerJoin(projects, eq(projectInterests.projectId, projects.id))
    .innerJoin(expertProfiles, eq(projects.expertProfileId, expertProfiles.id))
    .innerJoin(launcherProfiles, eq(projectInterests.launcherProfileId, launcherProfiles.id))
    .leftJoin(meetings, eq(meetings.interestId, projectInterests.id))
    .where(and(eq(expertProfiles.userId, expertUserId), eq(launcherProfiles.userId, launcherUserId)))
    .orderBy(desc(projectInterests.createdAt));
}

export async function listValidationExpertInterests() {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const expertUserId = await getValidationParticipantUserId("expert");
  const launcherUserId = await getValidationParticipantUserId("lancador");
  return db
    .select({ interest: projectInterests, project: projects, launcher: launcherProfiles, registration: registrations, meeting: meetings })
    .from(projectInterests)
    .innerJoin(projects, eq(projectInterests.projectId, projects.id))
    .innerJoin(expertProfiles, eq(projects.expertProfileId, expertProfiles.id))
    .innerJoin(launcherProfiles, eq(projectInterests.launcherProfileId, launcherProfiles.id))
    .innerJoin(registrations, eq(launcherProfiles.registrationId, registrations.id))
    .leftJoin(meetings, eq(meetings.interestId, projectInterests.id))
    .where(and(eq(expertProfiles.userId, expertUserId), eq(launcherProfiles.userId, launcherUserId)))
    .orderBy(desc(projectInterests.createdAt));
}
