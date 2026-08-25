import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BotaoCarregando } from "../client/src/components/BotaoCarregando";

describe("BotaoCarregando", () => {
  it("preserva a ação quando está disponível", () => {
    const html = renderToStaticMarkup(
      <BotaoCarregando textoCarregando="Salvando dados…">Salvar dados</BotaoCarregando>,
    );

    expect(html).toContain("Salvar dados");
    expect(html).toContain('aria-busy="false"');
    expect(html).not.toContain("Salvando dados…");
  });

  it("desabilita reenvio e anuncia o progresso durante o salvamento", () => {
    const html = renderToStaticMarkup(
      <BotaoCarregando carregando textoCarregando="Salvando dados…">Salvar dados</BotaoCarregando>,
    );

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("disabled");
    expect(html).toContain("Salvando dados…");
    expect(html).toContain("animate-spin");
  });
});
