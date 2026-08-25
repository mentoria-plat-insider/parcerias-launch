# Arquitetura Técnica

## Visão de contexto

O FL Insider organiza uma operação presencial de parcerias. A aplicação é composta por uma interface React, uma API tRPC sobre Express e uma camada de persistência Drizzle ORM/MySQL-TiDB. O navegador não recebe cadastros completos nem dados internos de triagem sem que a API autorize a consulta.

```text
Navegador React
      │ tRPC / HTTPS
      ▼
Express + tRPC ── autorização, validação Zod e regras de negócio
      │ Drizzle ORM
      ▼
MySQL/TiDB ── dados operacionais e trilha de auditoria
```

## Papéis e fronteiras de acesso

| Papel | Ações permitidas | Limites principais |
| --- | --- | --- |
| Administrador | Aprovar inscrições, triar projetos, gerir catálogo, interesses, agenda, indicadores e Administradores. | Rotas e procedimentos administrativos exigem privilégio de Administrador. |
| Expert | Criar, editar e submeter apenas o próprio projeto; consultar devolutiva e reuniões próprias. | Não consulta catálogo de Lançadores nem dados de outros Experts. |
| Lançador | Consultar catálogo elegível, filtrar, declarar interesse e consultar reuniões próprias. | Não acessa projetos pendentes/reprovados, triagens internas nem cadastros completos. |

Administradores podem validar os painéis de Expert e Lançador com `?operacao=admin`. Esse modo é limitado a dados demonstrativos para não expor ou alterar registros reais.

## Domínio persistido

| Entidade | Finalidade |
| --- | --- |
| `users` | Identidade de sessão, perfil base e versão de sessão. |
| `registrations` | Solicitações públicas de participação. |
| `expertProfiles` e `launcherProfiles` | Dados específicos de cada papel após aprovação. |
| `projects` | Proposta de um Expert, incluindo ROMA, Avatar, nicho e maturidade. |
| `projectTriages` | Decisões administrativas de elegibilidade. |
| `projectInterests` | Manifestação de interesse de um Lançador. |
| `meetings` | Agenda presencial, local, duração e recurso físico. |
| `auditLogs` | Eventos operacionais protegidos para acompanhamento administrativo. |
| `adminAccessGrants` | Concessões e revogações auditáveis de Administradores. |

O campo de maturidade aceita novos registros como `structuring`, `launched` e `launched_validated`. O valor `validated` é mantido apenas para leitura de dados legados.

## Organização de código

| Caminho | Responsabilidade |
| --- | --- |
| `client/src/pages/` | Rotas e experiências por papel. |
| `client/src/components/` | Componentes reutilizáveis, layout e controles de interface. |
| `server/routers/` | Contratos tRPC e políticas de autorização por domínio. |
| `server/db.ts` | Consultas e operações persistentes. |
| `server/security.ts` | Cabeçalhos HTTP, cache e limitação de taxa. |
| `drizzle/schema.ts` | Esquema Drizzle das entidades persistidas. |
| `drizzle/*.sql` | Migrações aplicadas de banco. |
| `server/**/*.test.ts` | Regressões de segurança, autorização e regras de negócio. |

## Sessão e segurança

A sessão OAuth usa cookie HTTP-only e token com validade de 12 horas. O token carrega uma versão persistida; quando a concessão administrativa é revogada, a versão é rotacionada e a sessão anterior é rejeitada. Não há extensão silenciosa de privilégio: a renovação exige novo fluxo explícito de autenticação.

Respostas de API usam política de não armazenamento em cache. O servidor também aplica CSP em produção, proteção contra framing, ocultação da assinatura do Express e limitação de taxa nas superfícies de API e retorno OAuth.

## Fluxo operacional

1. A pessoa preenche uma inscrição como Expert ou Lançador.
2. Um Administrador aprova ou reprova a inscrição e provisiona o perfil operacional.
3. O Expert estrutura e submete seu projeto.
4. A Administração realiza triagem manual e determina a elegibilidade para catálogo.
5. O Lançador aprovado declara interesse em um projeto elegível.
6. A Administração cria uma reunião presencial, bloqueando sobreposição de Expert, Lançador ou recurso físico.

## Limites conhecidos

O fluxo de participantes reais depende de autenticação própria por e-mail com link mágico, ainda não implementada. Antes de abrir o sistema para dados reais, também é necessária uma política operacional de privacidade, retenção e atendimento a titulares.

