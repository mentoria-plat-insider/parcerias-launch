import { describe, expect, it } from "vitest";
import { PROJECT_MATURITY_VALUES, projectDraftFields } from "./routers/projects";

describe("estágios de maturidade do projeto", () => {
  it("mantém exatamente os quatro estágios definidos para novos projetos", () => {
    expect(PROJECT_MATURITY_VALUES).toEqual(["structuring", "checked_up", "launched", "launched_validated"]);
  });

  it("aceita os estágios atuais e rejeita o valor legado isolado", () => {
    expect(projectDraftFields.safeParse({ maturity: "structuring" }).success).toBe(true);
    expect(projectDraftFields.safeParse({ maturity: "checked_up" }).success).toBe(true);
    expect(projectDraftFields.safeParse({ maturity: "launched" }).success).toBe(true);
    expect(projectDraftFields.safeParse({ maturity: "launched_validated" }).success).toBe(true);
    expect(projectDraftFields.safeParse({ maturity: "validated" }).success).toBe(false);
  });
});
