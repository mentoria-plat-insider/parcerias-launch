import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const lerPagina = (caminho: string) =>
  readFileSync(resolve(process.cwd(), "client", "src", "pages", caminho), "utf8");

describe("feedback operacional das ações persistentes", () => {
  it("mantém sucesso, erro e progresso no cadastro e envio de projeto do Expert", () => {
    const pagina = lerPagina("expert/CadastroProjeto.tsx");

    expect(pagina).toContain('toast.success("Rascunho salvo com segurança")');
    expect(pagina).toContain('toast.success("Cadastro enviado para validação")');
    expect(pagina).toContain('toast.error("Não foi possível salvar o rascunho"');
    expect(pagina).toContain('toast.error("Revise os campos obrigatórios"');
    expect(pagina).toContain('textoCarregando="Salvando rascunho…"');
    expect(pagina).toContain('textoCarregando="Enviando para curadoria…"');
  });

  it("mantém sucesso, erro e progresso ao declarar interesse como Lançador", () => {
    const pagina = lerPagina("lancador/LancadorPainel.tsx");

    expect(pagina).toContain('toast.success("Interesse registrado"');
    expect(pagina).toContain('toast.error("Não foi possível registrar o interesse"');
    expect(pagina).toContain('textoCarregando="Registrando interesse…"');
    expect(pagina).toContain("carregando={interessePendente}");
  });

  it("mantém progresso acessível nas decisões e na gestão administrativa", () => {
    const pagina = lerPagina("admin/AdminPainel.tsx");

    expect(pagina).toContain('textoCarregando="Registrando…"');
    expect(pagina).toContain('textoCarregando="Atualizando…"');
    expect(pagina).toContain('textoCarregando="Confirmando agendamento…"');
    expect(pagina).toContain('textoCarregando="Autorizando…"');
    expect(pagina).toContain('textoCarregando="Revogando…"');
    expect(pagina).toContain('toast.success("Reunião agendada")');
    expect(pagina).toContain('toast.error("Não foi possível agendar a reunião"');
  });
});
