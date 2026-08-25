/**
 * Parcerias FL Insider — domínio do MVP da Rodada de Parcerias.
 * Cada Expert possui um projeto. Administradores decidem manualmente sua
 * elegibilidade; Lançadores navegam pelo catálogo e solicitam reuniões.
 */

export type Papel = "admin" | "expert" | "lancador";

export interface Avatar {
  quem: string;
  dores: string[];
  ambicao: string;
}

export type StatusCadastro = "Rascunho" | "Enviado" | "Em validação" | "Aprovado" | "Reprovado";
export type StatusProjeto = "Em estruturação" | "Em triagem" | "Elegível para catálogo" | "Não elegível";
export type StatusInteresse = "Interesse declarado" | "Reunião solicitada" | "Reunião confirmada" | "Encerrado";

export interface Triagem {
  nicho: boolean;
  avatar: boolean;
  roma: boolean;
  maturidade: boolean;
  observacao: string;
  avaliadoPor?: string;
  avaliadoEm?: string;
}

export interface Projeto {
  id: string;
  nome: string;
  nicho: string;
  roma: string;
  avatar: Avatar;
  especialidades: string[];
  maturidade: "Em estruturação" | "Validado para lançamento" | "Já lançado";
  resultadoAnterior?: string;
  status: StatusProjeto;
  triagem: Triagem;
}

export interface Expert {
  id: string;
  nome: string;
  cargo: string;
  bio: string;
  fotoUrl: string;
  instagram: string;
  especialidadesGerais: string[];
  nivel: string;
  historicoLancamentos: number;
  diagnosticoConcluido: boolean;
  statusCadastro: StatusCadastro;
  projeto: Projeto;
}

export interface Lancador {
  id: string;
  nome: string;
  cargo: string;
  bio: string;
  fotoUrl: string;
  instagram: string;
  nicho: string;
  audiencia: string;
  stage: "Começando" | "Em crescimento" | "Experiente";
  resultado: string;
  leoaConcluida: boolean;
  statusCadastro: StatusCadastro;
}

export interface Interesse {
  id: string;
  expertId: string;
  lancadorId: string;
  projetoId: string;
  status: StatusInteresse;
  criadoEm: string;
  atualizadoEm?: string;
  agenda?: { data: string; horario: string; local: string };
}

export const experts: Expert[] = [
  {
    id: "exp-1", nome: "Dra. Marina Valle", cargo: "Nutricionista Funcional",
    bio: "Há 9 anos ajuda mulheres a transformar a relação com a comida e com o corpo, com foco em metabolismo e hábitos sustentáveis.",
    fotoUrl: "https://i.pravatar.cc/300?img=47", instagram: "@drmarinavalle",
    especialidadesGerais: ["Nutrição", "Saúde feminina", "Emagrecimento"], nivel: "Expert — 3 lançamentos concluídos", historicoLancamentos: 3,
    diagnosticoConcluido: true, statusCadastro: "Aprovado",
    projeto: {
      id: "proj-1", nome: "Método Corpo Leve", nicho: "Saúde e Bem-estar",
      roma: "Emagrecer de forma definitiva comendo o que ama",
      avatar: { quem: "Mulheres de 30 a 50 anos que já tentaram dietas restritivas e voltam a engordar", dores: ["Efeito sanfona", "Culpa ao comer", "Metabolismo lento percebido"], ambicao: "Perder peso sem abrir mão do prazer de comer e da vida social" },
      especialidades: ["Nutrição comportamental", "Reeducação alimentar"], maturidade: "Validado para lançamento", status: "Elegível para catálogo",
      triagem: { nicho: true, avatar: true, roma: true, maturidade: true, observacao: "Projeto completo e apto para o catálogo da Rodada de Parcerias.", avaliadoPor: "Ana — Administradora", avaliadoEm: "14/08/2026" },
    },
  },
  {
    id: "exp-2", nome: "Rafael Borges", cargo: "Especialista em Finanças Pessoais",
    bio: "Ex-executivo de banco que ensina famílias a sair das dívidas e construir patrimônio com método e disciplina.",
    fotoUrl: "https://i.pravatar.cc/300?img=12", instagram: "@rafaelborgesfin",
    especialidadesGerais: ["Finanças", "Investimentos", "Organização financeira"], nivel: "Expert — 5 lançamentos concluídos", historicoLancamentos: 5,
    diagnosticoConcluido: true, statusCadastro: "Aprovado",
    projeto: {
      id: "proj-2", nome: "Organiza + Patrimônio", nicho: "Finanças",
      roma: "Sair das dívidas e acumular os primeiros R$ 100 mil investidos",
      avatar: { quem: "Casais e profissionais de 28 a 45 anos endividados no cartão", dores: ["Dívidas no cartão", "Vergonha de falar de dinheiro", "Sensação de nunca sair do lugar"], ambicao: "Ter controle do dinheiro e construir patrimônio com segurança" },
      especialidades: ["Sair das dívidas", "Investimentos para iniciantes"], maturidade: "Já lançado", resultadoAnterior: "R$ 312 mil em 7 dias", status: "Elegível para catálogo",
      triagem: { nicho: true, avatar: true, roma: true, maturidade: true, observacao: "Projeto completo, com histórico comprovado e pronto para conversa com Lançadores.", avaliadoPor: "Ana — Administradora", avaliadoEm: "13/08/2026" },
    },
  },
  {
    id: "exp-3", nome: "Camila Duarte", cargo: "Mentora de Maternidade",
    bio: "Psicóloga perinatal dedicada a transformar o puerpério em uma fase de vínculo, e não de sobrevivência.",
    fotoUrl: "https://i.pravatar.cc/300?img=44", instagram: "@camiladuarte.mente",
    especialidadesGerais: ["Maternidade", "Saúde mental", "Puerpério"], nivel: "Expert — 1 lançamento concluído", historicoLancamentos: 1,
    diagnosticoConcluido: true, statusCadastro: "Em validação",
    projeto: {
      id: "proj-3", nome: "Maternidade Serena", nicho: "Maternidade",
      roma: "Viver os primeiros meses do bebê com serenidade em vez de culpa e exaustão",
      avatar: { quem: "Mães de primeira viagem, de 25 a 38 anos, sobrecarregadas pela maternidade perfeita", dores: ["Exaustão física e emocional", "Culpa por não dar conta", "Solidão no puerpério"], ambicao: "Sentir-se tranquila, confiante e presente com o bebê" },
      especialidades: ["Puerpério", "Vínculo mãe-bebê", "Saúde mental materna"], maturidade: "Em estruturação", status: "Em triagem",
      triagem: { nicho: true, avatar: true, roma: true, maturidade: false, observacao: "Avaliar maturidade e ativos mínimos para a conversa de parceria." },
    },
  },
  {
    id: "exp-4", nome: "Thiago Mendes", cargo: "Treinador de Performance Masculina",
    bio: "Prepara homens de 35+ para retomar energia, foco e disposição usando ciência do sono, treino e testosterona natural.",
    fotoUrl: "https://i.pravatar.cc/300?img=15", instagram: "@thiagomendes.fit",
    especialidadesGerais: ["Performance", "Saúde masculina", "Hábitos"], nivel: "Expert — 2 lançamentos concluídos", historicoLancamentos: 2,
    diagnosticoConcluido: true, statusCadastro: "Aprovado",
    projeto: {
      id: "proj-4", nome: "Protocolo Vitalidade 35+", nicho: "Saúde e Performance",
      roma: "Recuperar a energia e a disposição dos 25 anos depois dos 35",
      avatar: { quem: "Homens de 35 a 55 anos, executivos e empresários com cansaço crônico", dores: ["Cansaço crônico", "Sono fragmentado", "Queda de disposição"], ambicao: "Retomar energia, foco e presença na família e no trabalho" },
      especialidades: ["Sono", "Hormônios naturais", "Treino eficiente"], maturidade: "Já lançado", resultadoAnterior: "R$ 87 mil em 7 dias", status: "Não elegível",
      triagem: { nicho: true, avatar: true, roma: true, maturidade: false, observacao: "Necessário definir proposta de relançamento antes da publicação no catálogo.", avaliadoPor: "Ana — Administradora", avaliadoEm: "14/08/2026" },
    },
  },
];

export const lancadores: Lancador[] = [
  { id: "lan-1", nome: "Juliana Ferreira", cargo: "Lançadora — Saúde e Bem-estar", bio: "Construiu audiência de 180 mil seguidores falando de autocuidado feminino.", fotoUrl: "https://i.pravatar.cc/300?img=26", instagram: "@juhferreira.bem", nicho: "Saúde e Bem-estar feminino", audiencia: "Mulheres de 28 a 48 anos interessadas em autocuidado, estética e qualidade de vida", stage: "Começando", resultado: "Ainda sem lançamento", leoaConcluida: true, statusCadastro: "Aprovado" },
  { id: "lan-2", nome: "Pedro Almeida", cargo: "Lançador — Finanças", bio: "Audiência de 95 mil seguidores engajados em conteúdo de dinheiro.", fotoUrl: "https://i.pravatar.cc/300?img=33", instagram: "@pedroalmeidadin", nicho: "Finanças pessoais", audiencia: "Homens e casais de 28 a 45 anos endividados ou iniciantes em investimentos", stage: "Em crescimento", resultado: "R$ 41 mil no último lançamento", leoaConcluida: true, statusCadastro: "Aprovado" },
  { id: "lan-3", nome: "Beatriz Nogueira", cargo: "Lançadora — Maternidade", bio: "Audiência de 310 mil seguidoras no nicho de maternidade real.", fotoUrl: "https://i.pravatar.cc/300?img=32", instagram: "@bea.nogueira.mae", nicho: "Maternidade", audiencia: "Mães de 24 a 40 anos que consomem conteúdo sobre criação real", stage: "Experiente", resultado: "R$ 214 mil no último lançamento", leoaConcluida: true, statusCadastro: "Aprovado" },
  { id: "lan-4", nome: "Lucas Prado", cargo: "Lançador — Performance", bio: "Audiência de 60 mil seguidores no nicho de alta performance para executivos.", fotoUrl: "https://i.pravatar.cc/300?img=53", instagram: "@lucasprado.hp", nicho: "Alta performance", audiencia: "Executivos e empresários de 32 a 55 anos que buscam otimização de vida", stage: "Experiente", resultado: "R$ 156 mil no último lançamento", leoaConcluida: true, statusCadastro: "Aprovado" },
];

export const interesses: Interesse[] = [
  { id: "int-1", expertId: "exp-1", lancadorId: "lan-1", projetoId: "proj-1", status: "Reunião confirmada", criadoEm: "15/08/2026", atualizadoEm: "16/08/2026", agenda: { data: "20/08/2026", horario: "15:20", local: "Mesa 04 · Rodada de Parcerias" } },
  { id: "int-2", expertId: "exp-2", lancadorId: "lan-2", projetoId: "proj-2", status: "Interesse declarado", criadoEm: "16/08/2026" },
  { id: "int-3", expertId: "exp-3", lancadorId: "lan-3", projetoId: "proj-3", status: "Reunião solicitada", criadoEm: "17/08/2026" },
  { id: "int-4", expertId: "exp-4", lancadorId: "lan-4", projetoId: "proj-4", status: "Encerrado", criadoEm: "14/08/2026", atualizadoEm: "15/08/2026" },
];

export const projetosElegiveis = experts.filter((expert) => expert.projeto.status === "Elegível para catálogo");
export const getExpert = (id: string) => experts.find((expert) => expert.id === id);
export const getLancador = (id: string) => lancadores.find((lancador) => lancador.id === id);
export const getProjeto = (id: string) => getExpert(id)?.projeto;
