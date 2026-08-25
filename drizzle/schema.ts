import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  sessionVersion: int("sessionVersion").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** A public registration is required before any Expert or Lançador can operate in the event. */
export const registrations = mysqlTable(
  "registrations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestedRole: mysqlEnum("requestedRole", ["expert", "lancador"]).notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"])
      .default("pending")
      .notNull(),
    fullName: varchar("fullName", { length: 180 }).notNull(),
    phone: varchar("phone", { length: 32 }),
    instagram: varchar("instagram", { length: 120 }),
    approvedByUserId: int("approvedByUserId").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewNote: text("reviewNote"),
    reviewedAt: timestamp("reviewedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("registrations_userId_unique").on(table.userId),
    index("registrations_status_requestedRole_idx").on(table.status, table.requestedRole),
  ],
);

/** Data that identifies an approved Expert in the operation. */
export const expertProfiles = mysqlTable(
  "expertProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    registrationId: int("registrationId")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    headline: varchar("headline", { length: 180 }),
    bio: text("bio"),
    avatarUrl: varchar("avatarUrl", { length: 2048 }),
    instagram: varchar("instagram", { length: 120 }),
    generalSpecialties: json("generalSpecialties").$type<string[]>().notNull(),
    launchHistoryCount: int("launchHistoryCount").default(0).notNull(),
    diagnosticCompleted: boolean("diagnosticCompleted").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("expertProfiles_userId_unique").on(table.userId),
    uniqueIndex("expertProfiles_registrationId_unique").on(table.registrationId),
  ],
);

/** One Expert owns one project for the Rodada de Parcerias. */
export const projects = mysqlTable(
  "projects",
  {
    id: int("id").autoincrement().primaryKey(),
    expertProfileId: int("expertProfileId")
      .notNull()
      .references(() => expertProfiles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 180 }).notNull(),
    niche: varchar("niche", { length: 180 }).notNull(),
    subniche: varchar("subniche", { length: 180 }).notNull(),
    specialties: json("specialties").$type<string[]>().notNull(),
    maturity: mysqlEnum("maturity", ["structuring", "validated", "launched", "launched_validated"]).notNull(),
    avatarDescription: text("avatarDescription").notNull(),
    pains: json("pains").$type<string[]>().notNull(),
    ambition: text("ambition").notNull(),
    roma: text("roma").notNull(),
    mechanism: text("mechanism").notNull(),
    offerFormat: varchar("offerFormat", { length: 120 }).notNull(),
    priceRange: varchar("priceRange", { length: 120 }).notNull(),
    mainChannel: varchar("mainChannel", { length: 180 }).notNull(),
    primaryLink: varchar("primaryLink", { length: 2048 }).notNull(),
    evidence: text("evidence"),
    internalNote: text("internalNote"),
    informationConfirmed: boolean("informationConfirmed").default(false).notNull(),
    curationAuthorized: boolean("curationAuthorized").default(false).notNull(),
    exposureAcknowledged: boolean("exposureAcknowledged").default(false).notNull(),
    status: mysqlEnum("status", ["draft", "submitted", "under_review", "eligible", "not_eligible"])
      .default("draft")
      .notNull(),
    submittedAt: timestamp("submittedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("projects_expertProfileId_unique").on(table.expertProfileId),
    index("projects_status_niche_idx").on(table.status, table.niche),
  ],
);

/** Manual assessment only: there is no automatic compatibility score in this product. */
export const projectTriages = mysqlTable(
  "projectTriages",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    reviewerUserId: int("reviewerUserId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    nicheReviewed: boolean("nicheReviewed").default(false).notNull(),
    avatarReviewed: boolean("avatarReviewed").default(false).notNull(),
    romaReviewed: boolean("romaReviewed").default(false).notNull(),
    maturityReviewed: boolean("maturityReviewed").default(false).notNull(),
    decision: mysqlEnum("decision", ["eligible", "not_eligible"]).notNull(),
    observation: text("observation").notNull(),
    reviewedAt: timestamp("reviewedAt").defaultNow().notNull(),
  },
  table => [index("projectTriages_projectId_reviewedAt_idx").on(table.projectId, table.reviewedAt)],
);

/** Data that identifies an approved Lançador in the operation. */
export const launcherProfiles = mysqlTable(
  "launcherProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    registrationId: int("registrationId")
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    headline: varchar("headline", { length: 180 }),
    bio: text("bio"),
    avatarUrl: varchar("avatarUrl", { length: 2048 }),
    instagram: varchar("instagram", { length: 120 }),
    niche: varchar("niche", { length: 180 }).notNull(),
    audienceDescription: text("audienceDescription").notNull(),
    stage: mysqlEnum("stage", ["starting", "growing", "experienced"]).notNull(),
    latestResult: text("latestResult"),
    leoaCompleted: boolean("leoaCompleted").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("launcherProfiles_userId_unique").on(table.userId),
    uniqueIndex("launcherProfiles_registrationId_unique").on(table.registrationId),
  ],
);

/** A Lançador may express one active interest in each eligible project. */
export const projectInterests = mysqlTable(
  "projectInterests",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    launcherProfileId: int("launcherProfileId")
      .notNull()
      .references(() => launcherProfiles.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["declared", "requested", "confirmed", "closed"])
      .default("declared")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("projectInterests_project_launcher_unique").on(table.projectId, table.launcherProfileId),
    index("projectInterests_status_idx").on(table.status),
  ],
);

/** The operational outcome is an in-person meeting in the Rodada de Parcerias. */
export const meetings = mysqlTable(
  "meetings",
  {
    id: int("id").autoincrement().primaryKey(),
    interestId: int("interestId")
      .notNull()
      .references(() => projectInterests.id, { onDelete: "cascade" }),
    scheduledByUserId: int("scheduledByUserId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    scheduledFor: timestamp("scheduledFor").notNull(),
    location: varchar("location", { length: 180 }).notNull(),
    resource: varchar("resource", { length: 120 }).notNull().default("A definir"),
    durationMinutes: int("durationMinutes").notNull().default(30),
    status: mysqlEnum("status", ["scheduled", "completed", "cancelled"])
      .default("scheduled")
      .notNull(),
    operationalNote: text("operationalNote"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("meetings_interestId_unique").on(table.interestId),
    index("meetings_resource_schedule_idx").on(table.resource, table.scheduledFor),
  ],
);

/** Immutable accountability trail for administrative decisions and sensitive changes. */
export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    actorUserId: int("actorUserId").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entityType", { length: 80 }).notNull(),
    entityId: varchar("entityId", { length: 64 }).notNull(),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("auditLogs_entity_idx").on(table.entityType, table.entityId)],
);

/**
 * Administrators approved to manage the operation. A grant may exist before the
 * person completes their first authenticated access, which keeps invitations
 * separate from user identities and avoids pre-creating credentials.
 */
export const adminAccessGrants = mysqlTable(
  "adminAccessGrants",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id, { onDelete: "set null" }),
    fullName: varchar("fullName", { length: 180 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    status: mysqlEnum("status", ["pending", "active", "revoked"])
      .default("pending")
      .notNull(),
    createdByUserId: int("createdByUserId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    activatedAt: timestamp("activatedAt"),
    revokedAt: timestamp("revokedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("adminAccessGrants_email_unique").on(table.email),
    index("adminAccessGrants_status_idx").on(table.status),
  ],
);

export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;
export type ExpertProfile = typeof expertProfiles.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type LauncherProfile = typeof launcherProfiles.$inferSelect;
export type ProjectInterest = typeof projectInterests.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type AdminAccessGrant = typeof adminAccessGrants.$inferSelect;
