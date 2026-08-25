# FL Insider — Rodada de Parcerias

Aplicação web operacional para apoiar a **Rodada de Parcerias do Encontro Insider**. O sistema organiza a interação entre **Experts**, **Lançadores** e **Administradores**: o Expert estrutura um projeto, a Administração realiza uma triagem manual e os Lançadores consultam apenas o catálogo de projetos elegíveis para manifestar interesse em uma conversa presencial.

> **Premissa de negócio:** esta aplicação **não** executa matching automático, não atribui score de compatibilidade e não formaliza parcerias. A curadoria e a agenda permanecem sob decisão administrativa.

## Estado de prontidão

| Área | Situação atual |
| --- | --- |
| Administração | Inscrições, triagem, catálogo, interesses, agenda, auditoria e gestão de Administradores estão persistidos. |
| Expert | Projeto próprio em quatro etapas, rascunho, envio, devolutiva de triagem e reuniões próprias. |
| Lançador | Catálogo curado, busca, filtro, declaração de interesse e reuniões próprias. |
| Segurança aplicada | Procedimentos protegidos, autorização por perfil e propriedade, sessão de 12 horas, invalidação após revogação, cabeçalhos HTTP e limitação de taxa. |
| Uso com participantes reais | **Pendente.** Experts e Lançadores ainda precisam de uma conta Manus; a autenticação própria por e-mail com link mágico não foi implementada. |

## Arquitetura

| Camada | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Interface | React 19, TypeScript, Vite, Tailwind CSS 4 e shadcn/ui | Landing, cadastro e painéis dos três papéis. |
| API | Express 4 e tRPC 11 | Contratos tipados, autorização e regras de negócio. |
| Dados | Drizzle ORM e MySQL/TiDB | Inscrições, perfis, projetos, triagens, interesses, reuniões, auditoria e concessões administrativas. |
| Identidade | OAuth Manus | Sessão administrativa atual; participantes ainda não têm identidade própria. |
| Publicação | Ambiente gerenciado Manus | Deploy contínuo a partir de checkpoints do projeto. |

Consulte o diagrama e as decisões técnicas em [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Estrutura do repositório

```text
client/                 Interface React
server/                 API tRPC, regras de negócio e testes
drizzle/                Esquema e migrações do banco
shared/                 Tipos e constantes compartilhadas
docs/                   Arquitetura e material de revisão técnica
.github/                Automação de CI e modelos de colaboração
```

Os arquivos `server/_core/` pertencem à infraestrutura do template e devem ser alterados somente quando a extensão da plataforma realmente exigir isso.

## Execução local

### Pré-requisitos

- Node.js 22 ou versão compatível;
- pnpm, habilitado pelo Corepack;
- acesso às variáveis de ambiente do projeto para fluxos que utilizam OAuth e banco de dados.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

O servidor local responde, por padrão, em `http://localhost:3000`.

## Variáveis de ambiente

Não versione arquivos `.env` ou valores de credenciais. O ambiente gerenciado provê, entre outras, as variáveis abaixo.

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Conexão com o banco MySQL/TiDB. |
| `JWT_SECRET` | Assinatura das sessões. |
| `OAUTH_SERVER_URL` e `VITE_OAUTH_PORTAL_URL` | Fluxo OAuth Manus. |
| `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY` | Serviços internos gerenciados. |

Para uso local, solicite os valores pelos canais internos autorizados. Nunca os envie em issues, pull requests, commits ou capturas de tela.

## Qualidade e validação

```bash
pnpm test              # suíte Vitest completa; requer acesso ao banco gerenciado
pnpm test:ci           # testes reproduzíveis sem credenciais de banco
pnpm test:integration  # isolamento e persistência; requer DATABASE_URL autorizado
pnpm run check         # TypeScript sem emissão de arquivos
pnpm audit --prod      # dependências de produção
pnpm build             # build de cliente e servidor
```

O repositório inclui uma automação de integração contínua que executa `test:ci`, a checagem de tipos, a auditoria de dependências de produção e o build em pull requests e atualizações da branch `main`. Os testes de integração que tocam o banco gerenciado permanecem no comando explícito `test:integration`, para não expor credenciais no GitHub.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Domínio, camadas, dados, autorização e fluxos técnicos. |
| [docs/REVISAO_TECNICA.md](docs/REVISAO_TECNICA.md) | Escopo de revisão para TI, controles já existentes e pontos pendentes. |
| [guia-operacional-administracao.md](guia-operacional-administracao.md) | Operação da equipe administrativa durante a Rodada. |
| [auditoria-funcional-2026-08-19.md](auditoria-funcional-2026-08-19.md) | Evidências funcionais, controles e lacunas priorizadas. |
| [auditoria-seguranca-v1.md](auditoria-seguranca-v1.md) | Diagnóstico de segurança de referência. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Convenções para contribuições e revisão. |
| [SECURITY.md](SECURITY.md) | Processo de comunicação responsável de vulnerabilidades. |

## Contribuição e segurança

Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir uma alteração. Vulnerabilidades e potenciais exposições de dados devem ser reportadas exclusivamente conforme [SECURITY.md](SECURITY.md); não crie uma issue pública para esse fim.

## Pendências relevantes antes de abertura pública

1. Implantar autenticação própria por e-mail com link mágico para Experts e Lançadores.
2. Definir política operacional de dados pessoais, retenção, exclusão e atendimento a titulares.
3. Executar homologação ponta a ponta com identidades reais de teste.
4. Definir com o responsável a visibilidade e a proteção da branch no GitHub antes de liberar colaboração externa.
