# Roteiro de Revisão Técnica

## Finalidade

Este roteiro concentra a informação necessária para que a equipe de TI avalie o repositório, a arquitetura e a prontidão operacional do FL Insider. Ele não substitui teste de intrusão, parecer jurídico ou homologação com participantes reais.

## Escopo recomendado

| Frente | Itens de revisão |
| --- | --- |
| Arquitetura | Separação cliente/API/banco, contratos tRPC, modelo Drizzle, migrações e dependências. |
| Autenticação e autorização | OAuth administrativo, cookie HTTP-only, duração de sessão, versão de sessão, autorização por papel e propriedade de recurso. |
| Dados pessoais | Finalidade, minimização, retenção, exclusão, exportação e canal para titulares. |
| Segurança de aplicação | Validação Zod, controles de cache, CSP, limitação de taxa, trilhas de auditoria e manejo de erros. |
| Operação | Processo de triagem, agenda, bloqueio de conflitos, isolamento de demonstração e recuperação em caso de falha. |
| Entrega | Testes, tipos, auditoria de dependências, CI, proteção de branch e gestão de mudanças. |

## Controles presentes no código

| Controle | Evidência principal |
| --- | --- |
| Autorização administrativa | Procedures administrativas e `adminAccessGrants`. |
| Participação aprovada | Painéis de Expert e Lançador exigem inscrição aprovada no papel correspondente. |
| Propriedade de recursos | Operações de projeto e reuniões verificam a identidade no contexto da requisição. |
| Sessão limitada e revogável | Token de 12 horas associado à versão persistida da sessão. |
| Agenda sem conflito | Reuniões validam sobreposição de participante e recurso físico. |
| Auditoria operacional | Eventos relevantes são persistidos e consultados somente pela Administração. |
| Dados de demonstração isolados | Operação administrativa declarada restringe leituras e alterações a registros fictícios. |

## Itens pendentes antes da abertura pública

| Prioridade | Pendência | Decisão necessária |
| --- | --- | --- |
| P0 | Login próprio para participantes por e-mail com link mágico. | Escolher e configurar o provedor de identidade; Manus OAuth pode permanecer para Administração. |
| P0 | Política de dados pessoais. | Definir bases, finalidades, retenção, descarte, canal de atendimento e responsáveis. |
| P0 | Homologação ponta a ponta. | Executar inscrição, aprovação, projeto, triagem, interesse e agenda com contas reais de teste. |
| P1 | Confirmações e lembretes de reunião. | Definir canal, conteúdo, responsável e histórico de entrega. |
| P1 | Revisão de acessos administrativos. | Definir periodicidade, MFA e responsável por revogações. |

## Organização do GitHub aplicada

| Elemento | Situação |
| --- | --- |
| README técnico | Atualizado com propósito, arquitetura, comandos, variáveis e pendências. |
| Documentação | Centralizada em `docs/` para arquitetura e revisão técnica. |
| Colaboração | `CONTRIBUTING.md`, `SECURITY.md`, modelos de issue e de pull request. |
| Automação | Workflow de CI para tipos, testes, build e auditoria de dependências; Dependabot semanal. |
| Segredos | Varredura de padrões comuns nos arquivos rastreados sem ocorrência encontrada. Isso não substitui ferramenta dedicada de detecção nem revisão do histórico. |

## Decisões de governança para o responsável

Durante a varredura, o repositório foi identificado como **público**, sem proteção da branch `main` e sem tópicos configurados. Essas opções não foram modificadas automaticamente porque alteram a colaboração e a exposição externa do projeto.

Antes de ampliar o acesso à equipe, recomenda-se decidir formalmente:

1. se o repositório deve permanecer público ou ser privado;
2. se `main` deve exigir pull request aprovado e CI verde;
3. quem administra acessos e revisões técnicas;
4. qual licença, se houver, representa a propriedade intelectual do sistema.

## Verificação sugerida para cada pull request

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm run check
pnpm audit --prod
pnpm build
```

