import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, FileCheck2, Save, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BotaoCarregando } from "@/components/BotaoCarregando";
import { BadgeStatus, Label, LinhaDado } from "@/components/Compartilhados";
import { trpc } from "@/lib/trpc";

type Etapa = 1 | 2 | 3 | 4;
type DadosProjeto = {
  nome: string; nicho: string; subnicho: string; especialidades: string; maturidade: string; diagnostico: boolean;
  avatar: string; dores: string; ambicao: string; roma: string; mecanismo: string;
  formato: string; preco: string; canal: string; link: string; resultados: string; observacao: string;
  veracidade: boolean; curadoria: boolean; exposicao: boolean;
};

const etapas = [
  { numero: 1, titulo: "Contexto", texto: "Projeto e mercado" },
  { numero: 2, titulo: "ROMA e Avatar", texto: "Transformação e público" },
  { numero: 3, titulo: "Oferta", texto: "Evidências e ativos" },
  { numero: 4, titulo: "Revisão", texto: "Conferir e enviar" },
] as const;

const campo = "mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";
const inicial: DadosProjeto = {
  nome: "", nicho: "", subnicho: "", especialidades: "", maturidade: "", diagnostico: false,
  avatar: "", dores: "", ambicao: "", roma: "", mecanismo: "", formato: "", preco: "", canal: "", link: "", resultados: "", observacao: "",
  veracidade: false, curadoria: false, exposicao: false,
};
const maturidadeParaBanco = { "Em estruturação / Realizei o checkup": "structuring", "Já Lançado": "launched", "Já lançado com validação": "launched_validated" } as const;
const maturidadeDaBase = { structuring: "Em estruturação / Realizei o checkup", validated: "Em estruturação / Realizei o checkup", launched: "Já Lançado", launched_validated: "Já lançado com validação" } as const;
const separar = (valor: string) => valor.split(",").map(item => item.trim()).filter(Boolean);

export default function CadastroProjeto({ modoOperacaoAdmin = false }: { modoOperacaoAdmin?: boolean }) {
  const [etapa, setEtapa] = useState<Etapa>(() => {
    const etapaNaUrl = Number(new URLSearchParams(window.location.search).get("etapa"));
    return etapaNaUrl >= 1 && etapaNaUrl <= 4 ? etapaNaUrl as Etapa : 1;
  });
  const [dados, setDados] = useState<DadosProjeto>(inicial);
  const [enviado, setEnviado] = useState(false);
  const carregado = useRef<number | null>(null);
  const projetoProprio = trpc.projects.mine.useQuery(undefined, { retry: false, refetchOnWindowFocus: false, enabled: !modoOperacaoAdmin });
  const projetoValidacao = trpc.projects.validationMine.useQuery(undefined, { retry: false, refetchOnWindowFocus: false, enabled: modoOperacaoAdmin });
  const projeto = modoOperacaoAdmin ? projetoValidacao : projetoProprio;
  const utils = trpc.useUtils();

  useEffect(() => {
    const salvo = projeto.data?.project;
    if (!salvo || carregado.current === salvo.id) return;
    carregado.current = salvo.id;
    setDados({
      nome: salvo.name, nicho: salvo.niche, subnicho: salvo.subniche, especialidades: salvo.specialties.join(", "),
      maturidade: maturidadeDaBase[salvo.maturity], diagnostico: projeto.data?.profile.diagnosticCompleted ?? false,
      avatar: salvo.avatarDescription, dores: salvo.pains.join(", "), ambicao: salvo.ambition, roma: salvo.roma, mecanismo: salvo.mechanism,
      formato: salvo.offerFormat, preco: salvo.priceRange, canal: salvo.mainChannel, link: salvo.primaryLink,
      resultados: salvo.evidence ?? "", observacao: salvo.internalNote ?? "", veracidade: salvo.informationConfirmed,
      curadoria: salvo.curationAuthorized, exposicao: salvo.exposureAcknowledged,
    });
    if (salvo.status === "submitted") setEnviado(true);
  }, [projeto.data]);

  const alterar = (campoDados: keyof DadosProjeto, valor: string | boolean) => setDados(atual => ({ ...atual, [campoDados]: valor }));
  const proxima = () => setEtapa(atual => Math.min(4, atual + 1) as Etapa);
  const anterior = () => setEtapa(atual => Math.max(1, atual - 1) as Etapa);
  const dadosParciais = () => ({
    name: dados.nome, niche: dados.nicho, subniche: dados.subnicho, specialties: separar(dados.especialidades),
    maturity: dados.maturidade ? maturidadeParaBanco[dados.maturidade as keyof typeof maturidadeParaBanco] : undefined,
    avatarDescription: dados.avatar, pains: separar(dados.dores), ambition: dados.ambicao, roma: dados.roma, mechanism: dados.mecanismo,
    offerFormat: dados.formato, priceRange: dados.preco, mainChannel: dados.canal, primaryLink: dados.link,
    evidence: dados.resultados, internalNote: dados.observacao, informationConfirmed: dados.veracidade,
    curationAuthorized: dados.curadoria, exposureAcknowledged: dados.exposicao,
  });

  const salvarRascunho = trpc.projects.saveDraft.useMutation({
    onSuccess: async () => { await utils.projects.mine.invalidate(); toast.success("Rascunho salvo com segurança"); },
    onError: erro => toast.error("Não foi possível salvar o rascunho", { description: erro.message }),
  });
  const salvarRascunhoValidacao = trpc.projects.validationSaveDraft.useMutation({
    onSuccess: async () => { await utils.projects.validationMine.invalidate(); toast.success("Rascunho demonstrativo salvo com segurança"); },
    onError: erro => toast.error("Não foi possível salvar o rascunho demonstrativo", { description: erro.message }),
  });
  const enviarProjeto = trpc.projects.submit.useMutation({
    onSuccess: async () => { await utils.projects.mine.invalidate(); setEnviado(true); toast.success("Cadastro enviado para validação"); },
    onError: erro => toast.error("Revise os campos obrigatórios", { description: erro.message }),
  });
  const enviarProjetoValidacao = trpc.projects.validationSubmit.useMutation({
    onSuccess: async () => { await utils.projects.validationMine.invalidate(); setEnviado(true); toast.success("Projeto demonstrativo enviado para validação"); },
    onError: erro => toast.error("Revise os campos obrigatórios", { description: erro.message }),
  });
  const salvar = () => (modoOperacaoAdmin ? salvarRascunhoValidacao : salvarRascunho).mutate(dadosParciais());
  const enviar = () => {
    if (!dados.veracidade || !dados.curadoria || !dados.exposicao) {
      toast.error("Confirme as três declarações antes de enviar");
      return;
    }
    const maturidade = maturidadeParaBanco[dados.maturidade as keyof typeof maturidadeParaBanco];
    if (!maturidade) { toast.error("Informe a maturidade do projeto antes de enviar"); setEtapa(1); return; }
    (modoOperacaoAdmin ? enviarProjetoValidacao : enviarProjeto).mutate({ ...dadosParciais(), maturity: maturidade, informationConfirmed: true, curationAuthorized: true, exposureAcknowledged: true });
  };

  if (projeto.isLoading) return <section className="max-w-4xl py-8 text-sm text-muted-foreground" role="status"><span className="inline-flex items-center gap-2"><span className="size-4 animate-pulse rounded-full bg-primary/50" aria-hidden="true" />Carregando seu cadastro de projeto…</span></section>;
  if (enviado) return <section className="rise-in max-w-3xl mx-auto py-8"><div className="bg-card border border-border rounded-xl overflow-hidden"><div className="p-8 sm:p-10"><div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center"><FileCheck2 className="size-6" /></div><p className="label-ed text-primary mt-7">Cadastro enviado</p><h2 className="font-display text-3xl sm:text-4xl font-semibold mt-3">Seu projeto entrou na fila de curadoria.</h2><p className="text-muted-foreground leading-relaxed mt-4 max-w-xl">A operação fará uma leitura qualitativa de Nicho, Avatar, ROMA e maturidade. O projeto só aparece para Lançadores quando for considerado elegível para o catálogo.</p><div className="mt-7 flex flex-wrap items-center gap-3"><BadgeStatus status="Enviado" /><span className="text-sm text-muted-foreground">Próximo estado: Em validação</span></div>{modoOperacaoAdmin && <button type="button" onClick={() => setEnviado(false)} className="mt-6 min-h-11 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Editar a versão demonstrativa</button>}</div><div className="border-t border-border bg-secondary/45 px-8 sm:px-10 py-5 text-sm text-muted-foreground">Os dados foram armazenados com acesso restrito à operação. Você pode acompanhar a decisão no seu painel.</div></div></section>;

  return <section className="rise-in max-w-4xl">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-7"><div><div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><Sparkles className="size-3.5" />Cadastro operacional</div><h2 className="font-display text-3xl font-semibold mt-2">Cadastre seu projeto</h2><p className="text-sm text-muted-foreground mt-2 max-w-2xl">Você terá cerca de 10 minutos. Salve como rascunho se precisar reunir informações antes de enviar para a curadoria.</p></div><BadgeStatus status="Rascunho" /></div>
    <div className="bg-card border border-border rounded-xl overflow-hidden"><div className="p-5 sm:p-7 border-b border-border"><div className="grid grid-cols-4 gap-1 sm:gap-3">{etapas.map(item => <button key={item.numero} type="button" onClick={() => setEtapa(item.numero)} aria-label={`Ir para a etapa ${item.numero}: ${item.titulo}`} aria-current={etapa === item.numero ? "step" : undefined} className="min-h-11 rounded-sm text-left group"><div className={`h-1 rounded-full ${etapa >= item.numero ? "bg-primary" : "bg-border"}`} /><p className={`mt-3 text-xs sm:text-sm font-semibold ${etapa === item.numero ? "text-foreground" : "text-muted-foreground"}`}>{String(item.numero).padStart(2, "0")} <span className="hidden sm:inline">{item.titulo}</span></p><p className="hidden lg:block text-xs text-muted-foreground mt-1">{item.texto}</p></button>)}</div></div>
      <div className="p-5 sm:p-8">
        {etapa === 1 && <div className="space-y-6"><CabecalhoEtapa titulo="O contexto do seu projeto" texto="Esses dados ajudam a operação a entender o mercado e o momento da proposta." /><div className="grid sm:grid-cols-2 gap-5"><Campo label="Nome do projeto ou produto" obrigatorio><input className={campo} value={dados.nome} onChange={e => alterar("nome", e.target.value)} placeholder="Ex.: Método Corpo Leve" /></Campo><Campo label="Nicho principal" obrigatorio><select className={campo} value={dados.nicho} onChange={e => alterar("nicho", e.target.value)}><option value="">Selecione um nicho</option><option>Saúde e bem-estar</option><option>Finanças</option><option>Carreira e negócios</option><option>Relacionamentos</option><option>Educação</option><option>Outro</option></select></Campo><Campo label="Subnicho" obrigatorio><input className={campo} value={dados.subnicho} onChange={e => alterar("subnicho", e.target.value)} placeholder="Ex.: Emagrecimento feminino" /></Campo><Campo label="Maturidade do projeto" obrigatorio><select className={campo} value={dados.maturidade} onChange={e => alterar("maturidade", e.target.value)}><option value="">Selecione o estágio</option><option>Em estruturação / Realizei o checkup</option><option>Já Lançado</option><option>Já lançado com validação</option></select></Campo></div><Campo label="Especialidades que sustentam sua proposta" obrigatorio ajuda="Separe temas por vírgula. Use até cinco especialidades."><input className={campo} value={dados.especialidades} onChange={e => alterar("especialidades", e.target.value)} placeholder="Ex.: Nutrição comportamental, reeducação alimentar" /></Campo><Confirmacao marcado={dados.diagnostico} aoMudar={valor => alterar("diagnostico", valor)} texto="Concluí meu diagnóstico e tenho Nicho, Avatar e ROMA definidos." /></div>}
        {etapa === 2 && <div className="space-y-6"><CabecalhoEtapa titulo="Defina Avatar e ROMA" texto="O Lançador verá sua ROMA, seu Nicho e uma versão curada do Avatar se o projeto for elegível." /><Campo label="Quem é o seu Avatar?" obrigatorio ajuda="Descreva momento de vida, contexto e perfil. Evite respostas genéricas como “homens e mulheres”."><textarea rows={4} className={campo} value={dados.avatar} onChange={e => alterar("avatar", e.target.value)} placeholder="Ex.: Mulheres de 30 a 50 anos que já tentaram dietas restritivas e voltam a engordar." /></Campo><div className="grid sm:grid-cols-2 gap-5"><Campo label="Dores principais" obrigatorio ajuda="Liste pelo menos duas, separadas por vírgula."><textarea rows={4} className={campo} value={dados.dores} onChange={e => alterar("dores", e.target.value)} placeholder="Ex.: efeito sanfona, culpa ao comer" /></Campo><Campo label="Desejo ou ambição" obrigatorio><textarea rows={4} className={campo} value={dados.ambicao} onChange={e => alterar("ambicao", e.target.value)} placeholder="Ex.: Perder peso sem abrir mão da vida social." /></Campo></div><Campo label="Sua ROMA — a transformação prometida" obrigatorio ajuda="Use a fórmula: Ajudo [Avatar] a sair de [situação] e alcançar [transformação] por meio de [mecanismo]."><textarea rows={3} className={campo} value={dados.roma} onChange={e => alterar("roma", e.target.value)} placeholder="Ex.: Ajudo mulheres a emagrecer de forma definitiva comendo o que amam." /></Campo><Campo label="Mecanismo ou abordagem" obrigatorio><input className={campo} value={dados.mecanismo} onChange={e => alterar("mecanismo", e.target.value)} placeholder="Ex.: Nutrição comportamental e plano alimentar flexível" /></Campo></div>}
        {etapa === 3 && <div className="space-y-6"><CabecalhoEtapa titulo="Mostre como sua oferta se sustenta" texto="Estes dados são usados pela operação. Preço e links não aparecem automaticamente no catálogo." /><div className="grid sm:grid-cols-2 gap-5"><Campo label="Formato da oferta" obrigatorio><select className={campo} value={dados.formato} onChange={e => alterar("formato", e.target.value)}><option value="">Selecione o formato</option><option>Curso online</option><option>Mentoria</option><option>Comunidade</option><option>Consultoria</option><option>Programa híbrido</option><option>Outro</option></select></Campo><Campo label="Faixa de preço pretendida" obrigatorio><select className={campo} value={dados.preco} onChange={e => alterar("preco", e.target.value)}><option value="">Selecione uma faixa</option><option>Até R$ 497</option><option>R$ 498 a R$ 1.997</option><option>R$ 1.998 a R$ 4.997</option><option>Acima de R$ 4.997</option><option>A definir</option></select></Campo><Campo label="Principal canal ou audiência" obrigatorio><input className={campo} value={dados.canal} onChange={e => alterar("canal", e.target.value)} placeholder="Ex.: Instagram, lista de e-mails, YouTube" /></Campo><Campo label="Link principal" obrigatorio><input type="url" className={campo} value={dados.link} onChange={e => alterar("link", e.target.value)} placeholder="https://" /></Campo></div><Campo label="Resultados ou evidências" ajuda="Obrigatório para projetos já lançados. Cite resultados, cases, base de alunos ou validações relevantes."><textarea rows={4} className={campo} value={dados.resultados} onChange={e => alterar("resultados", e.target.value)} placeholder="Ex.: R$ 87 mil em 7 dias; mais de 300 alunas atendidas." /></Campo><Campo label="Observação para a operação" ajuda="Contexto que ajuda na triagem, mas não será mostrado no catálogo."><textarea rows={3} className={campo} value={dados.observacao} onChange={e => alterar("observacao", e.target.value)} placeholder="Compartilhe aqui uma particularidade do projeto ou uma necessidade para o evento." /></Campo></div>}
        {etapa === 4 && <div className="space-y-6"><CabecalhoEtapa titulo="Revise antes de enviar" texto="Confira a clareza da proposta. Após o envio, a operação começa a triagem manual." /><div className="grid sm:grid-cols-2 gap-x-8 gap-y-0 border border-border rounded-lg p-5"><LinhaDado rotulo="Projeto" valor={dados.nome || "Nome não informado"} /><LinhaDado rotulo="Nicho / subnicho" valor={[dados.nicho, dados.subnicho].filter(Boolean).join(" · ") || "Não informado"} /><LinhaDado rotulo="Avatar" valor={dados.avatar || "Não informado"} /><LinhaDado rotulo="ROMA" valor={dados.roma || "Não informado"} /><LinhaDado rotulo="Maturidade" valor={dados.maturidade || "Não informado"} /><LinhaDado rotulo="Formato" valor={dados.formato || "Não informado"} /></div><div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3"><CircleAlert className="size-5 shrink-0 text-primary mt-0.5" /><p className="text-sm text-muted-foreground leading-relaxed">Se aprovado, o catálogo exibirá somente informações curadas do projeto, incluindo <strong className="text-foreground">Nicho, Avatar e ROMA</strong>. Dados de preço, links e observações ficam restritos à operação.</p></div><div className="space-y-3"><Confirmacao marcado={dados.veracidade} aoMudar={valor => alterar("veracidade", valor)} texto="Confirmo que as informações representam corretamente meu projeto." /><Confirmacao marcado={dados.curadoria} aoMudar={valor => alterar("curadoria", valor)} texto="Autorizo a equipe FL Insider a realizar a triagem qualitativa deste cadastro." /><Confirmacao marcado={dados.exposicao} aoMudar={valor => alterar("exposicao", valor)} texto="Estou ciente de que meu projeto só será exibido no catálogo se for elegível." /></div></div>}
      </div>
      <div className="p-5 sm:px-8 border-t border-border bg-secondary/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><BotaoCarregando type="button" variant="ghost" onClick={salvar} carregando={(modoOperacaoAdmin ? salvarRascunhoValidacao : salvarRascunho).isPending} textoCarregando="Salvando rascunho…" className="min-h-11 px-3 text-muted-foreground hover:text-foreground"><><Save className="size-4" />Salvar rascunho</></BotaoCarregando><div className="flex w-full sm:w-auto items-center justify-end gap-2">{etapa > 1 && <button type="button" onClick={anterior} disabled={salvarRascunho.isPending || salvarRascunhoValidacao.isPending || enviarProjeto.isPending || enviarProjetoValidacao.isPending} className="min-h-11 inline-flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md disabled:opacity-60"><ChevronLeft className="size-4" />Voltar</button>}{etapa < 4 ? <button type="button" onClick={proxima} disabled={salvarRascunho.isPending || salvarRascunhoValidacao.isPending || enviarProjeto.isPending || enviarProjetoValidacao.isPending} className="min-h-11 inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-95 disabled:opacity-60"><span>Continuar</span><ChevronRight className="size-4" /></button> : <BotaoCarregando type="button" onClick={enviar} carregando={(modoOperacaoAdmin ? enviarProjetoValidacao : enviarProjeto).isPending} textoCarregando="Enviando para curadoria…" className="min-h-11 px-4 text-sm font-semibold"><><Send className="size-4" />Enviar para validação</></BotaoCarregando>}</div></div>
    </div>
    <p className="text-xs text-muted-foreground mt-4">As informações são salvas de forma persistente e ficam restritas à operação até a decisão de elegibilidade.</p>
  </section>;
}

function CabecalhoEtapa({ titulo, texto }: { titulo: string; texto: string }) { return <div><p className="label-ed text-primary">Etapa do cadastro</p><h3 className="font-display text-2xl font-semibold mt-2">{titulo}</h3><p className="text-sm text-muted-foreground mt-2 leading-relaxed">{texto}</p></div>; }
function Campo({ label, obrigatorio, ajuda, children }: { label: string; obrigatorio?: boolean; ajuda?: string; children: React.ReactNode }) { return <label className="block"><Label>{label}{obrigatorio && <span className="text-primary"> *</span>}</Label><p className="mt-1 min-h-5 text-xs leading-relaxed text-muted-foreground">{ajuda ?? "\u00a0"}</p>{children}</label>; }
function Confirmacao({ marcado, aoMudar, texto }: { marcado: boolean; aoMudar: (valor: boolean) => void; texto: string }) { return <label className="flex min-h-11 items-start gap-3 rounded-md py-2 cursor-pointer focus-within:bg-accent/40"><input type="checkbox" checked={marcado} onChange={e => aoMudar(e.target.checked)} className="mt-0.5 size-4 accent-primary" /><span className="text-sm text-muted-foreground leading-relaxed">{texto}</span></label>; }
