# Guia de Transferência Técnica

Este documento orienta pessoas e assistentes que precisem continuar o desenvolvimento do **FL Insider — Rodada de Parcerias**.

## Fonte de verdade

O projeto deixou de ser um protótipo estático. A implementação atual utiliza React, Express, tRPC, Drizzle ORM e banco MySQL/TiDB, com autenticação Manus OAuth para a sessão administrativa. Antes de alterar qualquer fluxo, consulte:

1. [README.md](README.md), para visão geral, comandos e estrutura;
2. [docs/ARQUITETURA.md](docs/ARQUITETURA.md), para domínio, autorização e organização de código;
3. [docs/REVISAO_TECNICA.md](docs/REVISAO_TECNICA.md), para controles e pendências de implantação;
4. [guia-operacional-administracao.md](guia-operacional-administracao.md), para a operação da Rodada;
5. [todo.md](todo.md), para o histórico de entregas e itens ainda abertos.

## Regras de negócio imutáveis sem validação do responsável

| Regra | Aplicação esperada |
| --- | --- |
| Não há matching automático. | Não criar score, ranking, recomendação nem aceite automático de parceria. |
| Triagem é manual. | A Administração decide elegibilidade a partir de Nicho, Avatar, ROMA e maturidade. |
| Catálogo é curado. | Lançadores visualizam somente projetos elegíveis. |
| Expert vê o próprio projeto. | Não expor dados ou projetos de outros Experts. |
| Resultado é uma reunião presencial. | Interesse é encaminhado para a agenda administrativa, que previne conflitos. |
| Dados demonstrativos são isolados. | O modo `?operacao=admin` deve usar exclusivamente os registros fictícios identificados. |

## Diretrizes para alterações

- Preserve a autorização no servidor; nunca dependa apenas de bloqueios visuais no cliente.
- Para mudanças de modelo, atualize `drizzle/schema.ts`, gere a migração, revise o SQL e aplique a migração de forma controlada.
- Cubra regras de negócio e permissões em testes Vitest dentro de `server/**/*.test.ts`.
- Execute `pnpm test`, `pnpm run check` e `pnpm audit --prod` antes de propor publicação.
- Não versione segredos, dumps de banco, arquivos `.env`, dados reais de participantes ou artefatos de logs.
- Use os modelos em `.github/` ao registrar bugs, evoluções e pull requests.

## Identidade visual

A aplicação usa azul-marinho `#1E2241`, Alexandria para títulos e Roboto para textos. A logo branca é usada nas barras laterais. Os ativos são publicados em armazenamento gerenciado e não devem ser copiados para o bundle local sem necessidade.
