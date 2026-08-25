import { describe, expect, it } from "vitest";
import { identifyMeetingSchedulingConflict, rangesOverlap } from "./db";

const inicio = new Date("2026-10-15T10:00:00.000Z");

const candidato = (overrides: Partial<{ scheduledFor: Date; durationMinutes: number; resource: string; launcherProfileId: number; expertProfileId: number }> = {}) => ({
  meeting: {
    scheduledFor: overrides.scheduledFor ?? inicio,
    durationMinutes: overrides.durationMinutes ?? 30,
    resource: overrides.resource ?? "Mesa 01",
  },
  launcherProfileId: overrides.launcherProfileId ?? 50,
  expertProfileId: overrides.expertProfileId ?? 60,
});

describe("conflitos de agenda presencial", () => {
  it("permite reuniões encostadas, sem sobreposição", () => {
    expect(rangesOverlap(inicio, 30, new Date("2026-10-15T10:30:00.000Z"), 30)).toBe(false);
    expect(identifyMeetingSchedulingConflict({ scheduledFor: new Date("2026-10-15T10:30:00.000Z"), durationMinutes: 30, resource: "Mesa 01", launcherProfileId: 50, expertProfileId: 60 }, [candidato()])).toBeNull();
  });

  it("bloqueia um recurso físico ocupado, ignorando variação de caixa", () => {
    expect(identifyMeetingSchedulingConflict({ scheduledFor: new Date("2026-10-15T10:15:00.000Z"), durationMinutes: 30, resource: "mesa 01", launcherProfileId: 10, expertProfileId: 20 }, [candidato()])).toBe("resource");
  });

  it("bloqueia sobreposição do mesmo Lançador", () => {
    expect(identifyMeetingSchedulingConflict({ scheduledFor: new Date("2026-10-15T10:15:00.000Z"), durationMinutes: 30, resource: "Mesa 02", launcherProfileId: 50, expertProfileId: 20 }, [candidato()])).toBe("launcher");
  });

  it("bloqueia sobreposição do mesmo Expert", () => {
    expect(identifyMeetingSchedulingConflict({ scheduledFor: new Date("2026-10-15T10:15:00.000Z"), durationMinutes: 30, resource: "Mesa 03", launcherProfileId: 10, expertProfileId: 60 }, [candidato()])).toBe("expert");
  });
});
