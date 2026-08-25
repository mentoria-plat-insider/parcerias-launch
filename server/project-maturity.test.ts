import { describe, expect, it } from "vitest";
import { PROJECT_MATURITY_VALUES, projectDraftFields } from "./routers/projects";

describe("estágios de maturidade do projeto", () => {
  it("mantém exatamente os três estágios validados para novos projetos", () => {
    expect(PROJECT_MATURITY_VALUES).toEqual(["structuring", "launched", "launched_validated"]);
  });

  it("aceita os estágios atuais e rejeita o valor legado isolado", () => {
    expect(projectDraftFields.safeParse({ maturity: "structuring" }).success).toBe(true);
    expect(projectDraftFields.safeParse({ maturity: "launched" }).success).toBe(true);
    expect(projectDraftFields.safeParse({ maturity: "launched_validated" }).success).toBe(true);
    expect(projectDraftFields.safeParse({ maturity: "validated" }).success).toBe(false);
  });
});
