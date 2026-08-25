/* @vitest-environment jsdom */
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const estado = vi.hoisted(() => ({
  pendente: false,
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  salvarRascunho: vi.fn(),
  declararInteresse: vi.fn(),
  salvarRascunhoOpcoes: undefined as { onSuccess?: () => Promise<void>; onError?: (erro: Error) => void } | undefined,
  declararInteresseOpcoes: undefined as { onSuccess?: () => Promise<void>; onError?: (erro: Error) => void } | undefined,
}));

const invalidar = vi.fn().mockResolvedValue(undefined);

vi.mock("sonner", () => ({ toast: { success: estado.toastSuccess, error: estado.toastError } }));
vi.mock("@/components/PainelLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("@/components/Compartilhados", () => ({
  BadgeStatus: ({ status }: { status: string }) => <span>{status}</span>,
  Label: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  LinhaDado: ({ rotulo, valor }: { rotulo: string; valor: string }) => <p>{rotulo}: {valor}</p>,
}));
vi.mock("@/components/ModoVisualizacao", () => ({ ModoVisualizacao: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      projects: { mine: { invalidate: invalidar }, validationMine: { invalidate: invalidar } },
      interests: { mineAsLauncher: { invalidate: invalidar }, validationMineAsLauncher: { invalidate: invalidar } },
    }),
    projects: {
      mine: { useQuery: () => ({ data: undefined }) },
      validationMine: { useQuery: () => ({ data: undefined }) },
      saveDraft: { useMutation: (opcoes: typeof estado.salvarRascunhoOpcoes) => { estado.salvarRascunhoOpcoes = opcoes; return { mutate: estado.salvarRascunho, isPending: estado.pendente }; } },
      validationSaveDraft: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      submit: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      validationSubmit: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      catalog: { useQuery: () => ({ data: [{ project: { id: 8, name: "Projeto de teste", niche: "Negócios", roma: "Transformar rotina", avatarDescription: "Profissional", pains: ["Tempo"], ambition: "Organizar", specialties: ["Gestão"] } }], isLoading: false, isError: false }) },
      validationCatalog: { useQuery: () => ({ data: [], isLoading: false, isError: false }) },
    },
    interests: {
      mineAsLauncher: { useQuery: () => ({ data: [], isLoading: false, isError: false }) },
      validationMineAsLauncher: { useQuery: () => ({ data: [], isLoading: false, isError: false }) },
      declare: { useMutation: (opcoes: typeof estado.declararInteresseOpcoes) => { estado.declararInteresseOpcoes = opcoes; return { mutate: estado.declararInteresse, isPending: estado.pendente }; } },
      validationDeclare: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

import CadastroProjeto from "../client/src/pages/expert/CadastroProjeto";
import LancadorPainel from "../client/src/pages/lancador/LancadorPainel";

afterEach(() => {
  cleanup();
  estado.pendente = false;
  estado.toastSuccess.mockReset();
  estado.toastError.mockReset();
  estado.salvarRascunho.mockReset();
  estado.declararInteresse.mockReset();
  estado.salvarRascunhoOpcoes = undefined;
  estado.declararInteresseOpcoes = undefined;
});

describe("feedback de operações persistentes", () => {
  it("desabilita, confirma e reporta erro ao salvar o rascunho do Expert", async () => {
    const usuario = userEvent.setup();
    const tela = render(<CadastroProjeto />);

    await usuario.click(tela.getByRole("button", { name: /salvar rascunho/i }));
    expect(estado.salvarRascunho).toHaveBeenCalledTimes(1);

    await estado.salvarRascunhoOpcoes?.onSuccess?.();
    expect(estado.toastSuccess).toHaveBeenCalledWith("Rascunho salvo com segurança");

    estado.salvarRascunhoOpcoes?.onError?.(new Error("Conexão indisponível"));
    expect(estado.toastError).toHaveBeenCalledWith("Não foi possível salvar o rascunho", { description: "Conexão indisponível" });

    estado.pendente = true;
    tela.rerender(<CadastroProjeto />);
    const botaoCarregando = tela.getByRole("button", { name: /salvando rascunho/i });
    expect(botaoCarregando).toHaveProperty("disabled", true);
    expect(botaoCarregando.getAttribute("aria-busy")).toBe("true");
  });

  it("desabilita, confirma e reporta erro ao registrar o interesse do Lançador", async () => {
    const usuario = userEvent.setup();
    const tela = render(<LancadorPainel onTrocarPapel={vi.fn()} />);

    await usuario.click(tela.getByRole("button", { name: /tenho interesse/i }));
    expect(estado.declararInteresse).toHaveBeenCalledWith({ projectId: 8 });

    await estado.declararInteresseOpcoes?.onSuccess?.();
    expect(estado.toastSuccess).toHaveBeenCalledWith("Interesse registrado", { description: "A operação recebeu seu pedido e organizará o próximo passo da Rodada." });

    estado.declararInteresseOpcoes?.onError?.(new Error("Projeto indisponível"));
    expect(estado.toastError).toHaveBeenCalledWith("Não foi possível registrar o interesse", { description: "Projeto indisponível" });

    estado.pendente = true;
    tela.rerender(<LancadorPainel onTrocarPapel={vi.fn()} />);
    const botaoCarregando = tela.getByRole("button", { name: /registrando interesse/i });
    expect(botaoCarregando).toHaveProperty("disabled", true);
    expect(botaoCarregando.getAttribute("aria-busy")).toBe("true");
  });

  it("organiza as informações do projeto em blocos claros ao abrir o detalhe", async () => {
    const usuario = userEvent.setup();
    render(<LancadorPainel onTrocarPapel={vi.fn()} />);

    await usuario.click(screen.getByRole("button", { name: /ver projeto/i }));

    expect(screen.getByText("Transformação proposta · ROMA")).toBeTruthy();
    expect(screen.getByText("Contexto do Avatar")).toBeTruthy();
    expect(screen.getByText("Principais dores")).toBeTruthy();
    expect(screen.getByText("Ambição")).toBeTruthy();
    expect(screen.getByText("Ao registrar interesse, a organização receberá seu pedido e conduzirá o próximo passo da Rodada.")).toBeTruthy();
    expect(screen.getByText("Gestão")).toBeTruthy();
  });
});
