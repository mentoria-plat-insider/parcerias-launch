# Auditoria Funcional e Roteiro de Implantação

**Sistema:** FL Insider — Rodada de Parcerias  
**Data da auditoria:** 19 de agosto de 2026  
**Responsável:** Manus AI  
**Escopo:** funcionalidades disponíveis, regras de acesso, persistência, experiência responsiva, evidências automatizadas, configuração de sessão e dependências de produção.

## Adendo de remediação — 19 de agosto de 2026

Após a emissão inicial desta auditoria, as dependências diretas afetadas foram atualizadas de forma compatível (`axios`, `drizzle-orm`, `express`, `streamdown` e `nanoid`). O componente genérico de gráficos e a dependência `recharts`, que não eram utilizados por nenhuma tela do produto, foram removidos para eliminar a cadeia transitiva vulnerável de `lodash`. A regressão posterior confirmou **34 testes aprovados**, TypeScript sem erros e `pnpm audit --prod` sem vulnerabilidades reportadas. Permanecem como riscos técnicos distintos o peer dependency desatualizado de `vite-plugin-jsx-loc` e quatro subdependências marcadas como obsoletas; elas não geram vulnerabilidade no relatório atual e devem ser acompanhadas em manutenção de rotina.

Em seguida, a aplicação recebeu cabeçalhos HTTP de endurecimento, proteção contra cache em todas as respostas de API, ocultação da assinatura do Express, política de conteúdo em produção e limitação de taxa por origem para a API e o retorno OAuth. A suíte passou a conter **38 testes**, incluindo cobertura para cabeçalhos, cache, limitação de taxa e configuração de analytics inválida. A validação local confirmou os cabeçalhos esperados e as respostas de API com `Cache-Control: no-store` e metadados de limite. A política de sessão foi então reduzida de um ano para **12 horas**, com emissão explícita de `iat` e teste de expiração. A aplicação também passou a versionar a sessão persistida: a revogação de uma concessão administrativa rotaciona a versão e torna o token anterior inválido na próxima requisição autenticada.

## Adendo de estabilidade da sessão — 19 de agosto de 2026

Após a reinicialização do servidor, a sincronização de uma conta de fixture executou o mesmo `upsert` utilizado pela autenticação e confirmou leitura de `users.sessionVersion` com o valor inicial `0`, sem `ER_BAD_FIELD_ERROR`. A fixture é removida ao término do teste. A suíte passou a ter **50 testes aprovados**, incluindo a rejeição de token expirado e a prova de persistência da versão de sessão; a checagem de tipos permanece sem erros.

## Síntese executiva

O sistema já ultrapassou a fase de protótipo visual. Há uma aplicação full stack com persistência para inscrições, projetos, triagens, interesses, reuniões, concessões administrativas e eventos de auditoria. A autorização é aplicada no servidor por tipo de procedimento e por papel, enquanto a aprovação administrativa restringe o uso dos painéis de Expert e Lançador. As visualizações demonstrativas também estão isoladas dos registros reais e permitem que Administradores validem o processo sem contaminar a operação. [1] [2] [3]

> **Conclusão de prontidão:** a plataforma está apta para validação controlada por Administradores, incluindo o fluxo demonstrativo. Ela ainda **não está pronta para abertura pública a Experts e Lançadores reais**, pois o cadastro depende de uma conta Manus e o acesso próprio por e-mail com link mágico ainda não foi implementado.

Os testes e a checagem de tipos concluídos nesta auditoria retornaram **34 testes aprovados** e nenhuma inconsistência de TypeScript. A navegação principal foi inspecionada em desktop e em tela móvel de 375 px. A interface pública, a inscrição, o painel de Administração e os dois modos demonstrativos se apresentam de forma responsiva e com estados de bloqueio compreensíveis. A auditoria não incluiu teste de intrusão, análise de infraestrutura do provedor, login de uma conta externa real ou validação jurídica.

| Dimensão | Estado atual | Avaliação |
|---|---|---|
| Operação administrativa | Inscrição, triagem manual, catálogo, interesses, agenda e gestão de Administradores estão implementados. | **Disponível para validação controlada** |
| Participante Expert | Projeto próprio em quatro etapas, rascunho, envio, status de triagem e reuniões. | **Disponível após autenticação existente** |
| Participante Lançador | Catálogo curado, busca, filtro, interesse e reuniões. | **Disponível após autenticação existente** |
| Acesso de participantes | A inscrição pública exige sessão Manus; não há identidade própria por e-mail. | **Bloqueador de abertura pública** |
| Segurança de autorização | Sessão, procedimentos protegidos, controles administrativos e propriedade de recurso no servidor. | **Base funcional implementada** |
| Segurança de dependências | Alertas de alta severidade identificados na auditoria foram corrigidos e a auditoria posterior não reporta vulnerabilidades de produção. | **Correção concluída; acompanhar manutenção de rotina** |
| Privacidade e governança | Há aviso de uso de dados e trilha de auditoria, mas faltam política operacional de privacidade, retenção e ciclo de direitos do titular. | **Pendente antes de dados reais** |

## Método e evidências

A revisão combinou inspeção de código, esquema de dados, procedimentos de negócio, documentação operacional, execução da suíte automatizada, verificação de tipos, análise de dependências, inspeção de cabeçalhos da publicação e revisão visual das principais rotas em desktop e mobile. Os registros demonstrativos foram tratados como dados de teste, não como evidência de fluxo real de participante.

| Evidência | Resultado observado | Limite da evidência |
|---|---|---|
| `pnpm test` | 34 testes aprovados, incluindo regras de acesso, isolamento demonstrativo e logout. | Não substitui teste de jornada com e-mail real. |
| `pnpm run check` | TypeScript sem erros. | Não valida comportamento em produção por si só. |
| Revisão de rotas | Rotas públicas e painéis protegidos apresentam estados de acesso coerentes. | O fluxo público continua dependente de OAuth Manus. |
| Revisão visual | Landing, cadastro, Admin, Expert e Lançador demonstrativos foram conferidos em desktop e 375 px. | Não equivale a teste assistivo com leitores de tela. |
| Cabeçalhos da publicação | HTTPS/HSTS, `nosniff`, antiframing, políticas de referência/permissão, proteção de cache da API e CSP na produção foram implementados. | Revisar CSP ao adicionar integrações de terceiros. |
| `pnpm audit` | Auditoria inicial encontrou alertas altos; a auditoria posterior à remediação não reporta vulnerabilidades de produção. | Exige manutenção contínua da árvore de dependências. |

## Inventário das funcionalidades disponíveis

### Experiência pública e inscrição

A landing explica o objetivo da Rodada, os papéis, a curadoria e os limites do sistema. O formulário de inscrição permite escolher Expert ou Lançador, registrar nome, telefone e Instagram e encaminhar o cadastro para revisão. A inscrição, entretanto, é uma mutação protegida: o servidor exige uma sessão autenticada antes de persistir o registro. Isso mantém o dado protegido, mas torna o convite público impraticável para quem não possui uma conta Manus. [4]

| Funcionalidade | Estado | Regra aplicada | Observação de auditoria |
|---|---|---|---|
| Landing e explicação do processo | Implementada | Pública | O conteúdo deixa claro que não existe matching automático. |
| Alternância claro/escuro | Implementada | Preferência persistida no navegador | Adequada para uso, sem impacto no domínio de negócio. |
| Inscrição de Expert/Lançador | Implementada parcialmente | Requer sessão Manus | É a maior lacuna para o público real. |
| Aprovação, reprovação e reenvio | Implementados | Decisão exclusivamente administrativa | Há observação obrigatória em revisão. |
| Aviso de uso dos dados | Implementado | Informativo | Deve evoluir para política e consentimento operacional. |

### Administração da Rodada

O painel administrativo concentra as decisões operacionais. O Administrador pode analisar inscrições, revisar projetos segundo Niche, Avatar, ROMA e maturidade, consultar o catálogo, acompanhar interesses, marcar reuniões e gerir concessões administrativas. A inclusão e a revogação de Administradores são auditadas; a autorrevogação é bloqueada. O e-mail autorizado de Arthur Lobo é sincronizado para o papel administrativo ao realizar login Manus. [2] [5]

| Funcionalidade | Estado | Controle observado | Lacuna remanescente |
|---|---|---|---|
| Fila de inscrições | Implementada | Exclusiva de Administradores | Não há notificação automática ao participante. |
| Triagem manual | Implementada | Quatro critérios obrigatórios, sem score automático | Faltam filtros e indicadores operacionais para escala. |
| Catálogo curado | Implementado | Exibe apenas projetos elegíveis | Requer teste com volume real de registros. |
| Agenda de reuniões | Implementada | Somente Administrador agenda data futura, duração, recurso físico e local | Bloqueia conflito de recurso, Expert e Lançador; lembretes permanecem pendentes. |
| Gestão de Administradores | Implementada | Inclusão, revogação e proteção contra autorrevogação | Recomenda-se MFA e revisão periódica de acessos. |
| BPMN do processo | Implementado | Visualização no painel | Deve acompanhar mudanças de processo e ser versionado. |

### Painel do Expert

O Expert aprovado tem acesso somente ao seu projeto, podendo salvar rascunho, preencher o formulário estruturado em quatro etapas, enviar para curadoria, acompanhar a decisão e consultar as próprias reuniões. A aplicação não expõe dados de Lançadores nessa visão. A regra de participação aprovada é executada antes das consultas e mutações do domínio. [2] [3]

| Funcionalidade | Estado | Resultado da auditoria |
|---|---|---|
| Projeto próprio | Implementado | Propriedade do recurso restrita no servidor. |
| Rascunho e envio | Implementados | Persistentes e com validação de payload. |
| ROMA, Avatar, nicho, oferta e maturidade | Implementados | Cobrem as informações mínimas definidas para curadoria. |
| Devolutiva de triagem | Implementada | O Expert acompanha a decisão sobre o próprio projeto. |
| Reuniões próprias | Implementada | Sem divulgação de dados desnecessários de Lançadores. |

### Painel do Lançador

O Lançador aprovado consulta somente o catálogo de projetos que passaram pela curadoria, pesquisa por projeto, nicho ou ROMA e declara interesse. A escolha é livre, sem recomendação algorítmica e sem exposição de cadastros pendentes ou reprovados. O interesse chega à fila administrativa, que registra a reunião presencial. [2] [6]

| Funcionalidade | Estado | Resultado da auditoria |
|---|---|---|
| Catálogo de elegíveis | Implementado | Mantém a regra de curadoria prévia. |
| Busca e filtro | Implementados | Adequados para validação; requerem teste de desempenho com volume real. |
| Declaração de interesse | Implementada | Vinculada ao Lançador autenticado e auditada. |
| Acompanhamento de reuniões | Implementado | Restrito às reuniões do próprio participante. |
| Matching automático | Não implementado por decisão | Coerente com a regra de negócio validada. |

### Modo demonstrativo e encerramento de sessão

Administradores podem alternar para as visões operacionais de Expert e Lançador por meio de `?operacao=admin`. As ações nesse contexto afetam apenas os dois registros fictícios identificados como demonstração; os testes cobrem o bloqueio de projetos reais nesse caminho. O botão **Sair** executa o encerramento da sessão, remove o cookie e limpa o cache local de identidade. [7] [8]

## Controles técnicos já consolidados

O diagnóstico anterior, elaborado quando o produto ainda era estático, não representa mais a arquitetura atual. As lacunas centrais daquele estágio — dados no bundle, ausência de banco, ausência de API e ausência de autorização de servidor — foram endereçadas pela aplicação full stack. Os dados do domínio residem no banco e os procedimentos protegidos exigem identidade; os procedimentos administrativos respondem com negação para perfis sem privilégio. [1] [2]

| Controle | Evidência atual | Avaliação |
|---|---|---|
| Autenticação administrativa | OAuth Manus com cookie HTTP-only | Implementada para Administradores vinculados ao ecossistema Manus. |
| Autorização por papel | `protectedProcedure` e `adminProcedure` no servidor | Implementada. |
| Autorização por participação | Expert/Lançador requerem cadastro aprovado no papel correspondente | Implementada. |
| Propriedade de recursos | Projeto e reuniões são buscados pelo usuário do contexto | Implementada no domínio revisado. |
| Validação de entradas | Schemas Zod em inscrições, triagens, projeto, interesse e agenda | Implementada nas rotas revisadas. |
| Auditoria | Eventos relevantes gravam ator, ação e entidade | Implementada, com consulta protegida, filtro por domínio e sem exposição de contatos ou observações internas. |
| Isolamento demonstrativo | Consultas e mutações de validação usam participantes fictícios definidos | Implementado e coberto por testes. |
| Transporte | HSTS e HTTPS observados na publicação | Implementado pelo ambiente de publicação. |
| Logout | Limpeza de cookie e cache local com cobertura automatizada | Implementado. |

## Lacunas e riscos priorizados

As prioridades abaixo distinguem bloqueadores de abertura pública de melhorias de operação. A classificação considera impacto em confidencialidade, integridade, continuidade do evento e aderência à regra de negócio; não é um parecer jurídico.

| Prioridade | Lacuna confirmada | Impacto | Direção de implementação |
|---|---|---|---|
| **P0** | Participantes ainda precisam de conta Manus. | O link público não é utilizável por Experts e Lançadores convidados que não pertencem à plataforma Manus. | Ativar e integrar login próprio por e-mail com link mágico, mantendo OAuth Manus apenas para Administração. |
| **Concluído** | Alertas de alta severidade em `drizzle-orm`, `axios`, `express/path-to-regexp`, `lodash` e `lodash-es`. | Componentes vulneráveis ampliavam risco na cadeia de fornecimento e na aplicação. | Dependências atualizadas, componente não utilizado removido, regressão executada e auditoria de produção posterior sem vulnerabilidades. |
| **P0** | Não há política operacional para retenção, eliminação, exportação e resposta a solicitações relativas a dados pessoais. | Telefone, Instagram, identidade e informações de negócio serão processados sem ciclo de vida documentado. | Definir finalidade, prazo, responsáveis, canal de atendimento, descarte e aviso de privacidade antes de coletar dados reais. |
| **P0** | Jornada ponta a ponta com identidade real de participante não foi executada. | Não há evidência de que convite, login, aprovação, retorno, projeto, interesse e reunião funcionam fora do ambiente de demonstração. | Construir cenários de homologação com contas de teste e evidências de aceite por papel. |
| **Concluído** | Limitação de taxa para API e retorno OAuth. | Abertura pública passou a contar com resposta de excesso, metadados de limite e proteção por origem. | Monitorar rejeições e recalibrar limites antes da abertura pública. |
| **Parcialmente concluído** | A sessão OAuth passou de um ano para 12 horas e é invalidada após revogação administrativa; a renovação exige nova autenticação, sem extensão silenciosa. | A janela de exposição foi reduzida e a perda de privilégio revoga a sessão existente; MFA administrativo permanece como evolução recomendada. | Revisar a política a cada evento e definir MFA para o perfil administrativo conforme a criticidade operacional. |
| **Concluído** | Cabeçalhos de endurecimento, CSP em produção, proteção contra cache de API e ocultação da assinatura do Express. | Controles implementados e cobertos por testes; revisar CSP ao adicionar novas integrações de terceiros. [9] |
| **Parcialmente concluído** | A agenda passou a registrar duração e recurso físico, bloqueando sobreposição de mesa, Expert ou Lançador. | Sobreposições operacionais são prevenidas; confirmações e lembretes continuam sem automação. | Integrar comunicações de reunião e definir capacidade operacional por recurso, se necessária. |
| **P1** | O usuário não recebe comunicação automática sobre aprovação, reprovação, interesse ou reunião. | Processo depende de acompanhamento manual do Administrador e pode falhar no dia do evento. | Integrar notificações por e-mail, com modelos revisados e histórico de entrega. |
| **P1** | O aviso de dados não substitui consentimento e transparência operacional completos. | Risco de comunicação insuficiente ao participante. | Publicar aviso de privacidade, versão do texto aceito e fundamento/finalidade revisados pelo responsável competente. |
| **P2** | Navegação móvel horizontal dos painéis deixa parte das abas fora do primeiro enquadramento. | A experiência permanece utilizável, mas a descoberta de opções diminui. | Evidenciar rolagem horizontal, priorizar abas ou mover opções secundárias para menu acessível. |
| **Concluído** | Log de auditoria pesquisável e indicadores operacionais agregados. | A Administração consulta eventos recentes, filtra por domínio e acompanha filas sem expor contatos ou observações internas. | Revisar periodicamente a retenção e a necessidade de exportação segura. |
| **P2** | Não há pipeline de segurança contínua visível para pull requests. | Correções de dependência e regressões de permissão podem passar despercebidas. | Adicionar CI com testes, tipos, auditoria de dependências e verificação de segredos. |
| **Concluído** | Indicadores operacionais de inscrições, projetos, interesses e reuniões. | A equipe acompanha filas e resultados agregados diretamente no painel administrativo. | Evoluir métricas apenas mediante necessidade operacional e minimização de dados. |

### Detalhe da auditoria de dependências

A análise encontrou versões vulneráveis na árvore instalada. Os itens devem ser tratados como correção técnica prioritária, mas com atualização controlada: bibliotecas transitivas podem exigir elevação da versão do pacote pai ou substituição de dependência. Não se recomenda simplesmente sobrescrever versões sem executar a suíte, a checagem de tipos e um teste manual dos fluxos críticos.

| Pacote/rota detectada | Versão vulnerável instalada | Versão indicada pelo relatório | Ação recomendada |
|---|---:|---:|---|
| `express` → `path-to-regexp` | `express@4.21.2` → `path-to-regexp@0.1.12` | `path-to-regexp >= 0.1.13` | Atualizar Express para uma versão que incorpore a correção e validar roteamento. |
| `streamdown` → `mermaid` → `lodash-es` | `lodash-es@4.17.21` | `lodash-es >= 4.18.0` | Atualizar a cadeia ou remover dependência não usada no produto. |
| `recharts` → `lodash` | `lodash@4.17.21` | `lodash >= 4.18.0` | Atualizar Recharts/cadeia correspondente; avaliar se o pacote é necessário. |
| `drizzle-orm` | `0.44.7` | `>= 0.45.2` | Atualizar ORM, gerar/revisar migrações e testar consultas. |
| `axios` | `1.12.2` | `>= 1.15.1` | Atualizar Axios e revisar integrações que fazem requisições externas. |

## Roteiro priorizado de implementação

### Marco 1 — Preparar a abertura segura

O primeiro marco deve eliminar os bloqueadores, sem adicionar escopo de negócio. Começa pela atualização controlada das dependências vulneráveis, pelo novo relatório sem alertas aplicáveis e por um ciclo de regressão que cubra cadastro, triagem, catálogo, interesse, reunião, logout e visualização demonstrativa. Em paralelo, o responsável do processo deve aprovar o provedor de identidade por e-mail e as decisões de privacidade necessárias para coletar dados reais.

| Entrega | Resultado esperado | Critério de aceite |
|---|---|---|
| Correção de dependências | Árvore de pacotes atualizada e compatível | Testes e tipos aprovados; auditoria sem alerta alto aplicável. |
| Política operacional de dados | Regras de finalidade, retenção e exclusão aprovadas | Aviso de privacidade publicado e responsável definido. |
| Segurança de borda | Rate limit, cabeçalhos e revisão de sessão | Testes de rejeição/limite e cabeçalhos conferidos em publicação. |
| Plano de homologação | Cenários reais de conta, papel e aprovação | Evidência registrada para os três perfis. |

### Marco 2 — Autenticação própria de participantes

Após a confirmação do usuário, o Stytch pode ser ativado para implementar link mágico por e-mail. A identidade do participante deve ser associada a um usuário local, sem substituir o acesso administrativo Manus. A sessão criada pelo link mágico precisa alimentar o mesmo contexto de autorização já utilizado pelos roteadores, para que as regras atuais de aprovação, papel e propriedade sejam preservadas.

| Entrega | Resultado esperado | Critério de aceite |
|---|---|---|
| Solicitação de link mágico | Convite público por e-mail, com proteção contra abuso | E-mail válido recebe link de uso único e expiração definida. |
| Confirmação e sessão | Participante entra sem conta Manus | Cookie de sessão seguro e identidade local criada/atualizada. |
| Cadastro público adaptado | Formulário funciona para Expert e Lançador convidados | Inscrição persiste, permanece pendente e não libera painel antes da aprovação. |
| Recuperação e saída | Acesso pode ser retomado pelo e-mail e encerrado conscientemente | Logout remove sessão e novo link restaura somente a identidade correta. |
| Teste de jornada | Fluxo real validado de ponta a ponta | Contas de homologação evidenciam os dois papéis e o Administrador. |

### Marco 3 — Garantir continuidade do evento

Com a identidade pronta, o foco deve migrar para a operação no dia do evento. A agenda precisa impedir conflitos e comunicar as partes; a equipe deve dispor de filtros para fila, estado da curadoria, interesses e reuniões. O modo demonstrativo deve continuar exclusivamente separado e sempre rotulado, pois é útil para treinamento sem comprometer a base real.

| Entrega | Resultado esperado | Critério de aceite |
|---|---|---|
| Agenda operacional | Horário, duração, recurso físico, status e conflito de recursos | Uma mesma pessoa ou recurso não é agendado em sobreposição. |
| Notificações | Confirmações e alterações chegam às pessoas corretas | Histórico de envio e estado de falha disponíveis à operação. |
| Painel de acompanhamento | Fila e indicadores operacionais agregados | Equipe identifica pendências sem exportar dados excessivos. |
| Consulta de auditoria | Eventos pesquisáveis por Administradores autorizados | Ação, ator, recurso e data podem ser investigados no painel operacional. |

### Marco 4 — Governança contínua

Depois da abertura, a manutenção deve ser orientada por revisão de acessos, cópias de segurança verificadas, monitoramento de erros, testes de permissão e encerramento planejado da operação. Ao fim da Rodada, acessos administrativos temporários e os dados pessoais devem seguir a política de retenção aprovada.

## Checklist de liberação para participantes reais

| Condição de liberação | Situação em 19/08/2026 |
|---|---|
| Login por e-mail com link mágico para participantes | **Pendente** |
| Fluxo real de Expert e Lançador homologado | **Pendente** |
| Administrador inicial e gestão de Administradores | **Implementado** |
| Aprovação manual antes do painel | **Implementado** |
| Dados reais fora do bundle público | **Implementado** |
| Autorizações por papel e recurso no servidor | **Implementado** |
| Dados demonstrativos isolados e identificados | **Implementado** |
| Atualização das dependências de alta severidade | **Implementado — auditoria de produção sem vulnerabilidades** |
| Política de dados e aviso de privacidade operacional | **Pendente** |
| Rate limit e cabeçalhos HTTP de segurança | **Implementado — limite de API, no-store e cabeçalhos endurecidos** |
| Duração de sessão | **Implementado — validade máxima de 12 horas** |
| Invalidação após alteração de privilégio | **Implementado — rotação da versão de sessão na revogação administrativa** |
| Renovação controlada de sessão | **Pendente** |
| Conflito de agenda | **Implementado — duração, recurso físico e bloqueio de sobreposição de participantes ou recurso** |
| Comunicação de reuniões | **Pendente** |
| Teste de aceitação ponta a ponta | **Pendente** |
| Consulta de auditoria e indicadores operacionais agregados | **Implementado — painel protegido, filtros por domínio e contagens agregadas** |

## Decisões necessárias do responsável pelo processo

Para iniciar o próximo marco, é necessário confirmar a ativação do Stytch como provedor de link mágico e definir se o segundo fator será obrigatório para todos os Administradores. Também é necessário aprovar quais dados de contato podem ser vistos por cada papel, qual será o prazo de retenção após o evento, quem responde por solicitações de exclusão/exportação e qual canal oficial será utilizado para as notificações de operação.

## Referências

[1] [Controle de procedimentos protegidos e administrativos](./server/_core/trpc.ts)  
[2] [Roteador de projetos, catálogo e triagem](./server/routers/projects.ts)  
[3] [Decisão de acesso aos painéis](./client/src/lib/accessGateDecision.ts)  
[4] [Roteador de inscrições](./server/routers/registrations.ts)  
[5] [Roteador de concessões administrativas](./server/routers/adminAccess.ts)  
[6] [Roteador de interesses e reuniões](./server/routers/interests.ts)  
[7] [Testes de isolamento da operação demonstrativa](./server/validation-isolation.test.ts)  
[8] [Testes de logout](./server/auth.logout.test.ts)  
[9] [OWASP — HTTP Security Response Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
