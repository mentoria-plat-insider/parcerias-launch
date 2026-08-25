/** Landing FL Insider v4 — catálogo curado e Rodada de Parcerias. */
import { ArrowRight, CalendarClock, CheckCircle2, ClipboardCheck, LockKeyhole, Search, ShieldCheck, Sparkles, UserRound, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoInsider } from "@/components/LogoInsider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

const irPara = (destino: string) => window.location.assign(destino);

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const abrirCadastro = () => {
    if (isAuthenticated) {
      irPara("/cadastro");
      return;
    }
    startLogin();
  };
  const abrirAreaProtegida = (destino: string) => {
    if (isAuthenticated) {
      irPara(destino);
      return;
    }
    startLogin();
  };

  return <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
    <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo principal</a>
    <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-30"><div className="container h-18 min-h-16 flex items-center justify-between gap-3"><LogoInsider className="w-28 sm:w-36" /><div className="flex items-center gap-2 sm:gap-3"><span className="hidden md:inline label-ed">Sistema de Parcerias</span><ThemeToggle /><Button size="sm" variant="outline" className="h-10 bg-card hover:bg-accent" disabled={loading} onClick={abrirCadastro}> {loading ? "Verificando acesso" : isAuthenticated ? "Meu cadastro" : "Entrar"}</Button></div></div></header>
    <main id="conteudo-principal" tabIndex={-1}>
      <section className="border-b border-border"><div className="container pt-16 pb-16 lg:pt-24 lg:pb-24"><div className="max-w-4xl"><div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider"><Sparkles className="size-3.5" />Encontro Insider · Rodada de Parcerias</div><h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mt-6 leading-[1.05]">Projetos validados.<br /><span className="text-primary">Conversas que avançam.</span></h1><p className="max-w-2xl text-base sm:text-lg text-muted-foreground mt-7 leading-relaxed">A central que organiza Experts, Lançadores e projetos preparados para a Rodada de Parcerias. O cadastro é aberto à comunidade e a operação aprova cada participação antes de liberar o painel.</p><div className="mt-9 flex flex-col sm:flex-row gap-3"><Button size="lg" className="gap-2" onClick={abrirCadastro}>Participar da Rodada <ArrowRight className="size-4" /></Button><Button size="lg" variant="outline" className="bg-card hover:bg-accent" onClick={() => irPara("/cadastro")}>Como funciona o cadastro</Button></div></div></div></section>
      <section className="container py-12 lg:py-16"><div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-10 lg:gap-16"><div><p className="label-ed text-primary">Modelo de operação</p><h2 className="font-display text-3xl font-semibold mt-3">Não é um sistema de match.</h2><p className="text-muted-foreground mt-4 leading-relaxed">A plataforma não determina parceria, nem substitui a conversa de negócio. Ela dá clareza para que cada Lançador conheça todos os projetos que passaram pela curadoria da operação.</p></div><div className="grid sm:grid-cols-2 gap-px bg-border border border-border rounded-lg overflow-hidden">{[
        [ClipboardCheck, "1. Cadastro validado", "Expert registra um projeto; Lançador confirma dados e LEOA."], [ShieldCheck, "2. Triagem manual", "A equipe avalia Nicho, Avatar, ROMA e maturidade."], [Search, "3. Catálogo curado", "Projetos elegíveis ficam disponíveis para todos os Lançadores."], [CalendarClock, "4. Conversa presencial", "O interesse segue para a agenda da Rodada de Parcerias."],
      ].map(([Icon, titulo, texto]) => { const Componente = Icon as typeof ClipboardCheck; return <article key={titulo as string} className="bg-card p-6"><Componente className="size-5 text-primary" /><h3 className="font-display font-semibold text-lg mt-5">{titulo as string}</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">{texto as string}</p></article>; })}</div></div></section>
      <section className="border-y border-border bg-secondary/35"><div className="container py-12 lg:py-16"><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"><div><p className="label-ed text-primary">Cada papel, uma responsabilidade</p><h2 className="font-display text-3xl font-semibold mt-3">Um fluxo claro para a operação do evento.</h2></div><p className="max-w-md text-sm text-muted-foreground">Os dados ficam disponíveis apenas para quem precisa tomar a próxima decisão no processo.</p></div><div className="grid md:grid-cols-3 gap-4 mt-9">{[
        [ShieldCheck, "Administrador", "Valida cadastros, registra a triagem qualitativa e organiza a agenda presencial.", "Abrir administração", "/painel/admin"],
        [UserRound, "Expert", "Mantém um único projeto, sua ROMA e acompanha somente os horários de reunião confirmados.", "Ver visão do Expert", "/painel/expert"],
        [UsersRound, "Lançador", "Navega por todos os projetos elegíveis, compara ROMA, Nicho e Avatar e declara interesse.", "Explorar catálogo", "/painel/lancador"],
      ].map(([Icon, titulo, texto, cta, destino]) => { const Componente = Icon as typeof ShieldCheck; return <article key={titulo as string} className="bg-card border border-border rounded-lg p-6 flex flex-col"><Componente className="size-6 text-primary" /><h3 className="font-display text-xl font-semibold mt-5">{titulo as string}</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">{texto as string}</p><Button variant="ghost" className="justify-start px-0 mt-5 hover:bg-transparent hover:text-primary gap-2" onClick={() => abrirAreaProtegida(destino as string)}>{cta as string}<ArrowRight className="size-4" /></Button></article>; })}</div></div></section>
      <section className="container py-12 lg:py-16"><div className="max-w-3xl border-l-2 border-primary pl-6"><p className="label-ed text-primary">Limites do sistema</p><h2 className="font-display text-3xl font-semibold mt-3">O encontro começa aqui. A parceria é construída pelas partes.</h2><p className="text-muted-foreground mt-4 leading-relaxed">A plataforma organiza o catálogo e a reunião. Ela não calcula compatibilidade automática, não sugere parceiros e não formaliza contratos ou negociações comerciais.</p><div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />Triagem humana</span><span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />Decisão do Lançador</span><span className="inline-flex items-center gap-2"><LockKeyhole className="size-4 text-primary" />Privacidade até a reunião</span></div></div></section>
    </main>
    <footer className="border-t border-border"><div className="container py-6 flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground"><span>FL Insider · Sistema de Parcerias</span><span>Inscrição sujeita à aprovação da operação do evento</span></div></footer>
  </div>;
}
