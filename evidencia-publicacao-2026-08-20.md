# Evidência de publicação — rota protegida

Em 20 de agosto de 2026, foi verificada a rota publicada `https://parcerlaunch-tflfurdr.manus.space/painel/admin` em uma sessão sem autenticação.

O sistema exibiu a tela **“Acesso protegido”**, com o texto orientando o acesso por conta e o controle **“Entrar para continuar”**. Nenhum conteúdo do painel administrativo foi apresentado.

Essa verificação confirma o bloqueio público da rota administrativa sem sessão. Ela não substitui a homologação de login Manus autenticado, de expiração da sessão, de logout e de troca de perfil, que permanecem tarefas dependentes de uma conta real autorizada.

## Homologação com sessão administrativa

Com autorização do responsável e o navegador conectado, o login Manus foi concluído e a rota publicada `/painel/admin` exibiu o painel administrativo, com menu de perfis e controle explícito de saída.

O seletor de perfil exibiu as três visões autorizadas: **Administrador**, **Expert** e **Lançador**. As transições para `/painel/expert?operacao=admin` e `/painel/lancador?operacao=admin` foram concluídas e apresentaram, respectivamente, os registros demonstrativos isolados do Expert e do Lançador. O seletor e o botão **Sair** permaneceram visíveis nos dois painéis.

Após novo login autorizado, o retorno de Lançador para `/painel/admin` foi concluído. O seletor foi aberto novamente no painel Administrativo e manteve as três opções disponíveis. O ciclo **Administrador → Expert → Lançador → Administrador**, incluindo a reabertura do menu no retorno, foi assim homologado na publicação.

Para comprovar a última transição pelo próprio seletor, sem logout nem alteração manual de URL, a sessão autenticada partiu do painel Administrativo para Lançador e, no menu visível desse painel, selecionou **Administrador**. A aplicação retornou para `/painel/admin`, com a sessão ativa identificada como **Administrador** e o menu administrativo disponível. O ciclo completo pelo seletor ficou comprovado em publicação.

## Validação controlada da política de sessão

Em ambiente controlado, a suíte direcionada executou cinco verificações de política e persistência de sessão. Ela confirmou duração padrão de 12 horas, inclusão de `sessionVersion` no token, rejeição de token emitido antes da rotação de versão, invalidação de token expirado e compatibilidade da persistência de `sessionVersion`. O token intencionalmente expirado foi rejeitado pela verificação JWT, retornando ausência de sessão e exigindo uma nova autenticação; portanto, não há renovação silenciosa.

## Validação integrada de fluxos persistentes

A suíte completa executou 59 testes em 18 arquivos, incluindo as regras de inscrição, permissões administrativas, edição e envio de projeto, catálogo curado, declaração de interesse, isolamento de dados demonstrativos e prevenção de conflitos da agenda. Os testes de integração confirmam a persistência da edição e do envio do projeto antes do interesse do Lançador, e as regras de agenda impedem sobreposição de recurso, Expert ou Lançador. Dessa forma, os fluxos de cadastro, triagem, catálogo, interesse e reunião estão conectados à camada persistente protegida; a homologação com contas reais de participantes permanece uma atividade distinta.

O botão **Sair** foi acionado na visão de Lançador. A aplicação retornou imediatamente à tela de **Acesso protegido** na mesma rota, exibindo apenas o botão de autenticação e sem conteúdo operacional. Assim, o acesso autenticado, a troca entre as três visões e o logout explícito foram homologados na publicação. A validação da expiração natural da sessão permanece pendente, pois exige aguardar o prazo operacional de 12 horas ou usar um ambiente de teste controlado.

## Validação técnica complementar de segurança

Após as evoluções de interface, a verificação de tipos e a suíte de testes foram executadas novamente com sucesso, totalizando 60 testes aprovados. A auditoria de dependências de produção não reportou vulnerabilidades conhecidas. Na publicação, a rota pública respondeu com HSTS, CSP, antiframing, proteção contra tipos de conteúdo, política de permissões e política de referência; a chamada de API respondeu com `Cache-Control: no-store`, CSP, antiframing e metadados de limitação de taxa. A cobertura automatizada mantém validações de autorização, isolamento demonstrativo, sessão, expiração, versão persistida e fluxos de domínio.
