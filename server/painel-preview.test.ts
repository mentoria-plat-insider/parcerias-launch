import { describe, expect, it } from "vitest";
import { deveMostrarTrocaPapel, isModoOperacaoAdmin, isModoVisualizacaoAdmin, rotaAdministrativaDoPerfil } from "../client/src/lib/painelPreview";

describe("modo de visualização administrativa", () => {
  it("nunca coloca o painel administrativo em modo somente leitura", () => {
    expect(isModoVisualizacaoAdmin("/painel/admin", "?visualizacao=admin")).toBe(false);
  });

  it("permite o modo somente leitura apenas quando solicitado explicitamente", () => {
    expect(isModoVisualizacaoAdmin("/painel/expert", "?modo=leitura")).toBe(true);
    expect(isModoVisualizacaoAdmin("/painel/lancador", "?modo=leitura")).toBe(true);
    expect(isModoVisualizacaoAdmin("/painel/expert", "")).toBe(false);
  });

  it("trata o antigo link visualizacao=admin como ambiente operacional, não como somente leitura", () => {
    expect(isModoOperacaoAdmin("/painel/expert", "?visualizacao=admin")).toBe(true);
    expect(isModoOperacaoAdmin("/painel/lancador", "?operacao=admin")).toBe(true);
    expect(isModoOperacaoAdmin("/painel/admin", "?operacao=admin")).toBe(false);
    expect(isModoVisualizacaoAdmin("/painel/expert", "?visualizacao=admin")).toBe(false);
  });

  it("mantém o seletor disponível ao Administrador no ambiente operacional", () => {
    expect(deveMostrarTrocaPapel("admin")).toBe(true);
    expect(deveMostrarTrocaPapel("expert", false, true)).toBe(true);
    expect(deveMostrarTrocaPapel("lancador", false, true)).toBe(true);
    expect(deveMostrarTrocaPapel("expert")).toBe(false);
    expect(deveMostrarTrocaPapel("lancador")).toBe(false);
  });

  it("gera as rotas operacionais corretas para cada item do seletor", () => {
    expect(rotaAdministrativaDoPerfil("admin")).toBe("/painel/admin");
    expect(rotaAdministrativaDoPerfil("expert")).toBe("/painel/expert?operacao=admin");
    expect(rotaAdministrativaDoPerfil("lancador")).toBe("/painel/lancador?operacao=admin");
  });
});
