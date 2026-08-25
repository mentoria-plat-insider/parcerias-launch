# Validação de Rotas Protegidas

**Data da validação:** 19 de agosto de 2026

Esta nota registra a validação visual realizada no ambiente publicado sem cookie de sessão. O objetivo foi confirmar que informações administrativas e dados de participantes não são expostos a visitantes não autenticados.

| URL validada | Estado sem sessão | Evidência observada | Resultado |
|---|---|---|---|
| `/painel/admin` | Visitante não autenticado | Tela “Acesso protegido”, com botão “Entrar para continuar”; nenhum item de inscrição, projeto ou agenda foi carregado. | Aprovado |
| `/painel/expert` | Visitante não autenticado | Tela “Acesso protegido”, com botão “Entrar para continuar”; nenhum projeto, ROMA ou reunião foi carregado. | Aprovado |
| `/painel/lancador` | Visitante não autenticado | Tela “Acesso protegido”, com botão “Entrar para continuar”; nenhum catálogo, interesse ou reunião foi carregado. | Aprovado |

> As capturas de `/painel/admin`, `/painel/expert` e `/painel/lancador` foram obtidas em navegação sem sessão no domínio publicado. As telas retornadas não contêm dados administrativos, de projetos, catálogo, interesses ou participantes.

## Cobertura automatizada relacionada

Além da verificação visual, a suíte de 34 testes passou integralmente. Ela cobre sessão e logout, permissões administrativas, limites de domínio para inscrições, projetos, interesses, reuniões e isolamento do ambiente demonstrativo.

O teste `server/access-gate-rules.test.ts` também exercita a decisão usada pelo portão de acesso das rotas. Ele confirma que Admin, Expert e Lançador retornam `login-required` sem sessão; que o painel administrativo aceita apenas Administrador; que o modo operacional é liberado somente quando a rota o declara; e que o perfil aprovado do participante é respeitado.

O teste de componente `server/access-gate-component.test.tsx` renderiza o `AccessGate` diretamente. Ele comprova que o conteúdo dos três painéis não é renderizado sem sessão e que a exceção do modo operacional administrativo só libera a rota quando `allowAdminPreview` é informado.

O teste de componente `server/papel-switcher.test.tsx` renderiza o seletor no painel operacional de Lançador, aciona as três opções e confirma os destinos administrativos gerados: Administrador (`/painel/admin`), Expert (`/painel/expert?operacao=admin`) e Lançador (`/painel/lancador?operacao=admin`).

## Limite desta validação

A confirmação de ações após login — inclusive a navegação como Administrador, Expert e Lançador na mesma sessão — depende de uma conta autenticada. Essa verificação deve continuar sendo realizada pela equipe operacional com o acesso administrativo autorizado.
