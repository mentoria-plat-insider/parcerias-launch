import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  onSelect: [] as Array<() => void>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => children,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => {
    mocks.onSelect.push(onClick);
    return children;
  },
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => children,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => children,
}));

import PapelSwitcher from "../client/src/components/PapelSwitcher";
import { rotaAdministrativaDoPerfil } from "../client/src/lib/painelPreview";

describe("PapelSwitcher", () => {
  beforeEach(() => {
    mocks.onSelect.length = 0;
  });

  it("mantém as três trocas disponíveis e encaminha cada escolha ao destino administrativo correto", () => {
    const destinos: string[] = [];
    const onTrocar = vi.fn((papel: "admin" | "expert" | "lancador") => {
      destinos.push(rotaAdministrativaDoPerfil(papel));
    });

    const html = renderToStaticMarkup(<PapelSwitcher papel="lancador" onTrocar={onTrocar} nomeUsuario="Administrador" />);

    expect(html).toContain("Administrador");
    expect(html).toContain("Expert");
    expect(html).toContain("Lançador");
    expect(mocks.onSelect).toHaveLength(3);

    mocks.onSelect.forEach((selecionar) => selecionar());

    expect(onTrocar).toHaveBeenNthCalledWith(1, "admin");
    expect(onTrocar).toHaveBeenNthCalledWith(2, "expert");
    expect(onTrocar).toHaveBeenNthCalledWith(3, "lancador");
    expect(destinos).toEqual(["/painel/admin", "/painel/expert?operacao=admin", "/painel/lancador?operacao=admin"]);
  });
});
