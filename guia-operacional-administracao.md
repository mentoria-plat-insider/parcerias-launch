# Guia Operacional — Administração da Rodada de Parcerias

**Sistema:** Parcerias FL Insider  
**Público:** Administradores autorizados da Rodada de Parcerias  
**Versão:** 1.0  
**Atualização:** 19 de agosto de 2026

## Finalidade e escopo

Este guia orienta a equipe administrativa na operação do sistema que conecta **Experts** — responsáveis por projetos e respectivas ROMAs — a **Lançadores** interessados em avaliar oportunidades de parceria durante a Rodada de Parcerias do Encontro Insider. A Administração conduz as decisões de participação, a triagem manual de projetos, a organização dos interesses e o agendamento presencial.

> **Princípio operacional:** o sistema não calcula score, não sugere pares e não confirma parceria comercial. A decisão de elegibilidade é humana; o catálogo somente apresenta projetos liberados; e o resultado operacional é uma reunião presencial organizada pela equipe.

## Perfis e limites de atuação

| Perfil | Pode acessar | Pode realizar | Não pode realizar |
|---|---|---|---|
| **Administrador** | Inscrições, cadastros de Experts e Lançadores, triagem, agenda, gestão de acessos e fluxo BPMN. | Aprovar ou devolver inscrições, tornar projetos elegíveis, agendar reuniões, gerenciar Administradores e usar os ambientes demonstrativos. | Ver ou editar projetos reais por meio do ambiente demonstrativo de Expert/Lançador. |
| **Expert** | O próprio projeto, o formulário de projeto e as próprias reuniões. | Salvar, enviar ou atualizar o próprio projeto conforme o status permitido. | Consultar informações de outros Experts ou a lista administrativa. |
| **Lançador** | O catálogo curado e as próprias reuniões. | Declarar interesse em projetos elegíveis e acompanhar os encaminhamentos. | Acessar projetos não elegíveis, dados administrativos ou interesses de terceiros. |

As regras descritas neste documento são aplicadas pelo painel e pelos procedimentos do servidor. O controle de acesso exige sessão válida e valida, além do perfil, a propriedade do recurso solicitado.[1] [2]

## Antes de iniciar a operação

O Administrador deve acessar **Administrador** no seletor de perfil do cabeçalho. A área administrativa possui sete seções: **Inscrições**, **Experts**, **Lançadores**, **Triagem manual**, **Reuniões**, **Administradores** e **Fluxo BPMN**. O botão **Sair** encerra a sessão e retorna à página pública; ele deve ser usado ao deixar uma estação compartilhada.[2]

| Verificação inicial | Critério de confirmação | Ação quando houver problema |
|---|---|---|
| Sessão administrativa | O menu administrativo e as sete seções estão disponíveis. | Encerre a sessão, faça novo acesso autorizado e confirme se o e-mail está na lista de Administradores ativos. |
| Fila de inscrições | A seção **Inscrições** carrega sem erro e mostra pendências ou a mensagem de fila vazia. | Atualize a página; se persistir, registre o horário e comunique a operação técnica. |
| Dados demonstrativos | Registros de teste exibem a etiqueta **Validação**. | Não trate registros identificados como demonstração como participantes do evento. |
| Ambiente operacional | Ao escolher Expert ou Lançador pelo seletor, o cabeçalho mantém o seletor de perfil visível. | Retorne a Administrador; se o seletor não estiver visível, registre a ocorrência e evite usar dados reais para testar. |

### Política de sessão administrativa

A sessão administrativa tem validade máxima de **12 horas**. Não existe renovação silenciosa nem extensão automática da sessão ao permanecer com a tela aberta. Quando a validade expirar, a pessoa deve realizar novamente o acesso autorizado pelo fluxo Manus; essa nova autenticação emite uma sessão nova e permite reavaliar os privilégios vigentes. Uma revogação administrativa também invalida a sessão existente na próxima requisição autenticada.[2]

| Situação | Conduta esperada |
|---|---|
| A sessão expira durante a operação | Salve o que estiver em andamento, realize novo acesso autorizado e confirme a seção administrativa antes de continuar. |
| O acesso administrativo foi revogado | Não tente reutilizar a sessão. A pessoa deve interromper a operação e solicitar uma nova autorização formal se houver necessidade futura. |
| Estação compartilhada | Use **Sair** ao terminar; não dependa apenas da expiração automática. |

## Fluxo operacional diário

### 1. Revisar inscrições

Em **Inscrições**, cada registro pendente informa o papel solicitado, contatos e data de envio. Antes de usar **Aprovar** ou **Devolver**, preencha o campo “Registro da decisão”. O sistema exige uma observação mínima para garantir rastreabilidade da decisão.[1]

| Decisão | Quando usar | Resultado no sistema |
|---|---|---|
| **Aprovar** | A pessoa atende aos critérios definidos pela operação para participar da Rodada. | A inscrição passa a aprovada e o perfil operacional correspondente é provisionado. |
| **Devolver** | Há impedimento, ausência de informação ou necessidade de nova avaliação. | A inscrição fica rejeitada/devolvida com a observação registrada. |

Não aprove inscrições apenas para testar a interface. Use os registros explicitamente identificados como **Demonstração** ou **[VALIDAÇÃO]** para esse fim.

### 2. Acompanhar cadastros por perfil

As seções **Experts** e **Lançadores** são de acompanhamento. Elas permitem à Administração verificar quem se cadastrou, o papel solicitado e o status da participação. Essas listas não substituem a triagem do projeto: um Expert aprovado só entra no catálogo depois que seu projeto for avaliado em **Triagem manual**.[1]

### 3. Conduzir a triagem manual de projetos

A seção **Triagem manual** recebe projetos enviados pelo Expert. Para cada projeto, leia o **nicho**, o **Avatar**, a **ROMA** e o grau de maturidade descrito. Registre uma observação clara da decisão e utilize a checklist apresentada no painel como confirmação de leitura.

| Decisão de triagem | Significado | Efeito no catálogo |
|---|---|---|
| **Marcar elegível** | O projeto está completo para ser apresentado a Lançadores. | Passa a constar no catálogo curado. |
| **Não elegível** | O projeto não deve ser apresentado neste ciclo. | Não aparece no catálogo de Lançadores. |

> **Importante:** “elegível” não é aprovação de parceria, garantia de resultado nem indicação automática de aderência. É somente a liberação operacional para visualização no catálogo.

### 4. Acompanhar interesses e organizar reuniões

Quando um Lançador declara interesse, o item aparece em **Reuniões**. A equipe administrativa usa essa seção para transformar o interesse em encontro presencial. Selecione **Agendar**, informe data e hora, duração, recurso físico, local e, quando aplicável, uma nota operacional. O sistema bloqueia sobreposição que envolva o mesmo recurso, Expert ou Lançador. O local padrão é “Rodada de Parcerias — Encontro Insider”.[1]

| Situação apresentada | Leitura operacional recomendada |
|---|---|
| **Interesse declarado** | O Lançador selecionou o projeto; ainda não existe agendamento associado. |
| **Reunião agendada** | A data, o horário, a duração, o recurso físico, o local e a nota operacional já foram registrados pela Administração. |

Registre no campo de nota qualquer contexto necessário para a equipe do evento, sem incluir informações sensíveis que não sejam necessárias à organização da reunião.

## Gestão de Administradores

A seção **Administradores** é restrita a Administradores ativos. Para adicionar alguém, informe nome completo e e-mail. A nova autorização fica como **Pendente de primeiro acesso** até que a pessoa entre com a identidade correspondente; depois disso, o status passa a ativo. A revogação interrompe futuras permissões administrativas e é registrada para auditoria.[1]

| Status | Interpretação | Próximo passo |
|---|---|---|
| **Pendente de primeiro acesso** | A autorização foi criada, mas ainda não foi vinculada a uma sessão compatível. | Oriente a pessoa a fazer o primeiro acesso com o e-mail autorizado. |
| **Ativo** | A pessoa pode operar as funções administrativas. | Mantenha somente quem necessita do acesso. |
| **Revogado** | A autorização não deve mais conceder funções administrativas. | Não reutilize; crie nova autorização somente se houver nova necessidade e aprovação. |

Nenhuma senha é exibida, enviada ou administrada pelo painel. Não compartilhe sessão, navegador ou credenciais entre membros da equipe.[1]

## Uso seguro do ambiente demonstrativo

O Administrador pode alternar para as visões de **Expert** e **Lançador** pelo seletor de perfil. Essas visões usam o ambiente operacional de validação e os registros fictícios identificados na interface; elas não devem ser utilizadas para editar registros reais. O seletor permanece disponível nos dois painéis para que seja sempre possível retornar a **Administrador**.[2] [3]

| Objetivo de teste | Sequência recomendada |
|---|---|
| Validar o formulário do Expert | Escolha **Expert** → abra **Cadastro do projeto** → trabalhe somente no projeto identificado como validação → envie para triagem. |
| Validar o catálogo do Lançador | Retorne a **Administrador** → marque o projeto demonstrativo como elegível → escolha **Lançador** → confira o catálogo e declare interesse no projeto demonstrativo. |
| Validar a agenda | Retorne a **Administrador** → abra **Reuniões** → localize o interesse demonstrativo → agende a reunião fictícia. |

Ao testar, mantenha a etiqueta **Validação** visível. Caso um registro não esteja identificado como demonstração, não o use para teste e retorne imediatamente ao painel administrativo.

## Segurança, privacidade e evidências

O sistema separa a operação administrativa da visualização de participantes e aplica controles de autorização no servidor. Projetos, interesses e reuniões do ambiente demonstrativo têm escopo limitado aos registros de teste; fluxos administrativos de validação não devem expor dados reais.[4] As rotas protegidas também foram verificadas sem sessão, bloqueando o conteúdo de Admin, Expert e Lançador, enquanto o modo operacional é permitido apenas quando a rota o declara.[5]

| Situação | Procedimento seguro |
|---|---|
| Uma pessoa sem perfil vê mensagem de bloqueio | Não aprove manualmente o acesso fora do fluxo; revise a inscrição e o perfil solicitado. |
| Um registro real aparece no ambiente de validação | Interrompa o teste, não altere o registro e comunique a operação técnica com data, tela e identificador do item. |
| Uma decisão foi tomada de forma incorreta | Registre a ocorrência e use o procedimento administrativo definido pela operação; não tente corrigir por acesso direto ao banco. |
| O seletor de perfil ou o botão Sair não responde | Atualize a página. Persistindo o problema, registre a rota, o perfil ativo e o horário antes de acionar o suporte técnico. |

## Checklist para o dia do evento

Antes da abertura da Rodada de Parcerias, a Administração deve confirmar os itens a seguir.

| Item | Confirmação |
|---|---|
| A lista de Administradores ativos foi revisada. | [ ] |
| Inscrições pendentes foram avaliadas e possuem observação. | [ ] |
| Projetos elegíveis foram revisados manualmente. | [ ] |
| O catálogo contém somente projetos liberados. | [ ] |
| Interesses declarados foram convertidos em uma agenda de mesa/horário quando aplicável. | [ ] |
| Registros de demonstração continuam identificados e foram separados da operação real. | [ ] |
| A equipe sabe usar **Sair** ao finalizar cada sessão compartilhada. | [ ] |

## Limitação conhecida e próxima evolução

No estado atual, o cadastro público direciona o participante ao fluxo de login Manus antes do envio da inscrição.[7] A autenticação própria de participantes por e-mail com link mágico ainda requer a ativação e a configuração de um provedor externo antes de substituir esse requisito. Essa mudança deve ser tratada como uma implantação de autenticação, com validação de domínio, redirecionamentos, expiração de links e testes de sessão próprios.[6] [7]

## Referências

[1]: ./client/src/pages/admin/AdminPainel.tsx "Painel administrativo e ações operacionais"
[2]: ./client/src/components/PainelLayout.tsx "Navegação de perfis, sessão e logout"
[3]: ./client/src/lib/painelPreview.ts "Regras de visualização e operação administrativa"
[4]: ./server/validation-isolation.test.ts "Cobertura de isolamento de dados demonstrativos"
[5]: ./validacao-rotas-protegidas.md "Evidências e cobertura das rotas protegidas"
[6]: ./auditoria-seguranca-v1.md "Riscos e evolução recomendada de autenticação"
[7]: ./client/src/pages/CadastroParticipacao.tsx "Fluxo público de inscrição e login atual"
