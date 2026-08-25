/**
 * Parcerias FL Insider — sidebar neutra, alto contraste e hierarquia operacional.
 */
import { ReactNode, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Papel } from "@/lib/mockData";
import { BotaoCarregando } from "@/components/BotaoCarregando";
import PapelSwitcher from "@/components/PapelSwitcher";
import { LogoInsider } from "@/components/LogoInsider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { deveMostrarTrocaPapel } from "@/lib/painelPreview";

interface NavItem {
  id: string;
  label: string;
  contagem?: number;
}

const navegacao: Record<Papel, NavItem[]> = {
  admin: [
    { id: "inscricoes", label: "Inscrições" },
    { id: "experts", label: "Experts" },
    { id: "lancadores", label: "Lançadores" },
    { id: "triagem", label: "Triagem manual" },
    { id: "agenda", label: "Reuniões" },
    { id: "operacao", label: "Operação" },
    { id: "administradores", label: "Administradores" },
    { id: "fluxo", label: "Fluxo BPMN" },
  ],
  expert: [
    { id: "meu-projeto", label: "Meu projeto" },
    { id: "cadastro", label: "Cadastro do projeto" },
    { id: "reunioes", label: "Minhas reuniões" },
  ],
  lancador: [
    { id: "projetos", label: "Projetos disponíveis" },
    { id: "reunioes", label: "Minhas reuniões" },
  ],
};

export function useNavegacao(papel: Papel) {
  return navegacao[papel];
}

interface PainelLayoutProps {
  papel: Papel;
  onTrocarPapel: (p: Papel) => void;
  nomeUsuario: string;
  paginaAtiva: string;
  onNavegar: (id: string) => void;
  children: ReactNode;
  titulo: string;
  subtitulo?: string;
  modoVisualizacao?: boolean;
  modoOperacaoAdmin?: boolean;
  mostrarTrocaPapel?: boolean;
}

export default function PainelLayout({
  papel,
  onTrocarPapel,
  nomeUsuario,
  paginaAtiva,
  onNavegar,
  children,
  titulo,
  subtitulo,
  modoVisualizacao = false,
  modoOperacaoAdmin = false,
  mostrarTrocaPapel = deveMostrarTrocaPapel(papel, modoVisualizacao, modoOperacaoAdmin),
}: PainelLayoutProps) {
  const nav = navegacao[papel];
  const { logout } = useAuth();
  const [encerrandoSessao, setEncerrandoSessao] = useState(false);

  const encerrarSessao = async () => {
    if (encerrandoSessao) return;
    setEncerrandoSessao(true);
    try {
      await logout();
      window.location.assign("/");
    } catch {
      setEncerrandoSessao(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo principal</a>
      {/* Sidebar */}
      <aside className="sidebar-shell hidden lg:flex w-64 shrink-0 flex-col sticky top-0 h-screen">
        <div className="sidebar-brand p-6 pb-5 flex items-center">
          <LogoInsider className="sidebar-logo" variante="branca" />
        </div>
        <div className="sidebar-divider mx-5" />
        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map((item, i) => (
            <button
              key={item.id}
              onClick={() => onNavegar(item.id)}
              className={cn(
                "sidebar-nav-item w-full flex items-center justify-between px-3 py-2.5 text-sm transition-all duration-150 active:scale-[0.98]",
                paginaAtiva === item.id
                  ? "sidebar-nav-active font-semibold"
                  : "sidebar-nav-idle",
              )}
              style={paginaAtiva === item.id ? { animationDelay: `${i * 40}ms` } : undefined}
            >
              <span>{item.label}</span>
              {item.contagem !== undefined && (
                <span
                  className={cn(
                    "sidebar-count font-mono text-xs font-semibold px-1.5 py-0.5",
                    paginaAtiva === item.id ? "sidebar-count-active" : "sidebar-count-idle",
                  )}
                >
                  {item.contagem}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider mx-5" />
        <div className="sidebar-session m-3 mt-4 p-3.5">
          <p className="sidebar-session-label mb-1.5">Sessão ativa</p>
          <p className="sidebar-session-name">{nomeUsuario}</p>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 min-h-16 bg-background/90 backdrop-blur-md border-b border-border px-4 sm:px-5 lg:px-8 py-2 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg lg:text-xl font-semibold leading-tight">{titulo}</h1>
              {modoVisualizacao && <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Somente leitura</span>}
            </div>
            {subtitulo && <p className="text-xs text-muted-foreground hidden sm:block">{subtitulo}</p>}
          </div>
          <div className="panel-mobile-wordmark shrink-0 items-center gap-2 lg:hidden" aria-hidden="true">
            <LogoInsider compact />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            {mostrarTrocaPapel && <PapelSwitcher papel={papel} onTrocar={onTrocarPapel} nomeUsuario={nomeUsuario} />}
            <BotaoCarregando
              type="button"
              onClick={encerrarSessao}
              carregando={encerrandoSessao}
              textoCarregando="Saindo…"
              aria-label="Encerrar sessão"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <><LogOut className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Sair</span></>
            </BotaoCarregando>
          </div>
        </header>

        {/* Navegação mobile */}
        <nav className="lg:hidden sticky top-16 z-10 bg-background border-b border-border overflow-x-auto" aria-label="Navegação do painel">
          <div className="flex px-4 gap-1 py-2 min-w-max">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavegar(item.id)}
                aria-current={paginaAtiva === item.id ? "page" : undefined}
                className={cn(
                  "min-h-11 px-3.5 py-2 rounded-md text-sm whitespace-nowrap transition-colors",
                  paginaAtiva === item.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {item.label}
                {item.contagem !== undefined && <span className="ml-1.5 font-mono text-xs opacity-70">{item.contagem}</span>}
              </button>
            ))}
          </div>
        </nav>

        <main id="conteudo-principal" tabIndex={-1} className="flex-1 px-5 lg:px-8 py-6 lg:py-8 max-w-6xl w-full">{children}</main>

        <footer className="px-5 lg:px-8 py-5 border-t border-border">
          <p className="label-ed">FL Insider · Rodada de Parcerias</p>
        </footer>
      </div>
    </div>
  );
}
