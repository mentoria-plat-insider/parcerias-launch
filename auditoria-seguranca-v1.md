# Diagnóstico de Segurança — Sistema de Parcerias FL Insider

**Data da análise:** 18 de agosto de 2026  
**Escopo:** revisão de código do protótipo publicado, configuração de entrega e cabeçalhos HTTP da versão pública. Não incluiu teste de intrusão, varredura autenticada, engenharia social ou revisão de infraestrutura do provedor.

## Síntese executiva

O sistema atual é um **protótipo visual estático**. Ele valida a experiência dos três papéis — Administrador, Expert e Lançador — mas ainda não possui autenticação, banco de dados, API operacional, sessão de usuário nem autorização aplicada no servidor. Por isso, a postura correta é tratá-lo como **adequado para demonstração com dados fictícios**, e **não apto para receber, armazenar ou expor dados reais de participantes**.

> A prioridade não é “endurecer” a interface atual; é criar uma camada de aplicação segura antes de substituir os dados simulados por cadastros reais. Autorização precisa ser verificada a cada requisição, com negação por padrão e privilégio mínimo. [1]

## 1. Estrutura atual observada

| Camada | Implementação atual | Consequência de segurança |
|---|---|---|
| Interface | React 19, TypeScript, Vite, Wouter e componentes Radix/shadcn. | O navegador entrega toda a interface e a lógica de demonstração ao visitante. |
| Servidor | Express serve exclusivamente os arquivos estáticos compilados e devolve `index.html` para as rotas do cliente. | Não há endpoints de negócio, autenticação, autorização ou persistência no servidor. |
| Dados | Experts, Lançadores, projetos, triagens e interesses estão em `client/src/lib/mockData.ts`. | Qualquer dado real colocado nesse arquivo será incorporado ao bundle público do navegador. |
| Perfis | As rotas `/painel/admin`, `/painel/expert` e `/painel/lancador` são rotas de interface. | Alterar a URL é suficiente para abrir qualquer painel; não existe controle de acesso efetivo. |
| Ações | Triagem, interesse e cadastro usam `useState` e notificações locais. | As ações não criam registros confiáveis, não são auditáveis e podem ser alteradas por ferramentas do navegador. |
| Armazenamento de ativos | Os ativos de marca são solicitados por `/manus-storage`; no desenvolvimento, o proxy usa uma credencial de servidor para obter URL temporária. | A credencial não é enviada ao cliente nesse fluxo, o que é positivo; porém o proxy não substitui uma camada de dados protegida. |

## 2. Controles já presentes

O protótipo não está desprotegido em todos os aspectos. A publicação atual responde em HTTPS e foi observada com `Strict-Transport-Security` e `X-Content-Type-Options: nosniff`; também usa `Cache-Control: no-store`. Esses controles reduzem riscos de downgrade de transporte, interpretação indevida de MIME e persistência de páginas em cache.

O repositório ignora arquivos `.env*`, bancos locais e arquivos de log. Além disso, a configuração de desenvolvimento restringe acesso ao sistema de arquivos do Vite e mantém a chave do proxy de ativos no processo do servidor. O formulário deixa explícito que é uma simulação e não persiste o seu conteúdo. Estas são boas práticas para a fase de protótipo, mas não substituem proteção de dados em operação.

| Controle existente | Estado | Limite atual |
|---|---|---|
| TLS/HSTS de publicação | Observado na resposta pública. | Não protege regras de acesso ou dados enviados pela aplicação. |
| `nosniff` e não-cache | Observados na resposta pública. | Não cobre CSP, antiframing, referrer policy ou permissões de navegador. |
| Segredos fora do cliente no proxy de ativos | Parcialmente presente no ambiente de desenvolvimento. | Não existe gestão de segredos nem rotação documentada para funções de negócio. |
| `.gitignore` para `.env*` e logs | Presente. | É necessário validar isso também no histórico e na automação de entrega. |
| Dados de demonstração no código | Adequado para validação visual. | É proibitivo para dados reais, pois o bundle é público. |

## 3. Lacunas e riscos prioritários

| Prioridade | Achado | Risco para o sistema | Direção de correção |
|---|---|---|---|
| **P0** | Não há autenticação nem sessão. | Qualquer visitante pode abrir as três visões por URL. | Implementar login e sessão de servidor antes de qualquer dado real. |
| **P0** | Não há autorização no servidor. | Um Expert poderia tentar acessar objetos de outro Expert ou uma rota administrativa caso esses dados passem a existir. | Aplicar negação por padrão e política de acesso em cada endpoint e consulta. [1] |
| **P0** | O domínio de negócio vive no bundle estático. | PII, informações de audiência, resultados, links ou observações reais seriam expostos ao público. | Migrar dados para banco privado e retornar somente campos permitidos por perfil. |
| **P0** | Triagem e interesse são apenas estados locais. | Não existe integridade, trilha de auditoria, autoria confiável ou histórico de decisão. | Criar API autenticada, registros transacionais e log de auditoria imutável por evento. |
| **P1** | Validação do formulário é somente de experiência; não há validação de submissão no servidor. | Entradas inconsistentes ou maliciosas chegariam ao banco quando a persistência for criada. | Validar e normalizar todas as entradas no servidor com esquemas Zod; impor limites de tamanho, listas permitidas e tipos de URL. |
| **P1** | Cabeçalhos de endurecimento incompletos. | Menor proteção contra clickjacking, XSS e vazamento de referer. | Adicionar CSP, `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, COOP e política de origem adequada. [3] |
| **P1** | Carregamentos de terceiros para fontes e analytics. | O fornecedor recebe metadados de navegação; uma política permissiva ampliaria a superfície de scripts. | Manter inventário de terceiros, configurar CSP restritiva e revisar finalidade/privacidade do analytics. |
| **P1** | Não há limitação de taxa, proteção antifraude ou monitoramento de autenticação. | Quando o login existir, haverá risco de enumeração, força bruta e abuso de endpoints. | Aplicar rate limiting por rota, backoff, monitoramento e MFA para Administradores. |
| **P2** | A análise automática de dependências não retornou resultado do registro nesta execução. | Não é possível afirmar que a cadeia de dependências está livre de vulnerabilidades conhecidas. | Criar etapa de CI com `pnpm audit`, atualização controlada, SBOM e revisão de alertas. |

## 4. Arquitetura segura recomendada

O próximo passo técnico deve ser transformar o projeto em uma aplicação full stack com autenticação, banco e API. A segurança deve ser aplicada no servidor, e não baseada na rota, no botão escondido ou no estado da interface.

```text
Navegador
  │ HTTPS
  ▼
Aplicação web
  ├── Sessão HTTP-only, Secure, SameSite
  ├── API autenticada
  │     ├── Autorização por papel + propriedade do registro
  │     ├── Validação/normalização de entrada (Zod)
  │     ├── Rate limit e registro de eventos
  │     └── Proteção CSRF para operações mutáveis com cookie
  ├── Banco de dados privado
  │     ├── Usuários e papéis
  │     ├── Projetos, triagens e interesses
  │     └── Log de auditoria append-only
  └── Armazenamento privado de arquivos, com URLs temporárias e autorização
```

### Modelo mínimo de autorização

| Recurso/ação | Administrador | Expert | Lançador |
|---|---:|---:|---:|
| Ler cadastro completo de Expert | Sim, quando necessário à operação | Apenas o próprio | Não |
| Criar/editar projeto | Não, salvo suporte administrativo auditado | Apenas o próprio projeto | Não |
| Aprovar ou reprovar triagem | Sim | Não | Não |
| Ler catálogo elegível | Sim | Não, salvo sua própria visão | Sim |
| Declarar interesse | Não, salvo gestão operacional auditada | Não | Apenas em nome próprio |
| Agendar reunião | Sim | Ler somente as próprias | Ler somente as próprias |

Essa matriz deve ser executada no servidor em toda leitura e escrita. Autenticação identifica quem está acessando; autorização decide o que essa identidade pode fazer. O uso de sessão com cookies `Secure`, `HttpOnly` e `SameSite`, renovação após alteração de privilégio e expiração são princípios recomendados para preservar essa fronteira. [2]

## 5. Roteiro de implementação priorizado

### Fase A — bloqueadores antes de dados reais

1. Habilitar a base full stack com banco e autenticação.
2. Trocar todos os dados de `mockData.ts` por repositórios privados; manter apenas dados fictícios no ambiente de demonstração.
3. Modelar `users`, `roles`, `experts`, `lancadores`, `projetos`, `triagens`, `interesses`, `reunioes` e `audit_logs`.
4. Implementar login, logout, expiração de sessão e MFA obrigatório para Administradores.
5. Criar middleware de autorização por papel e propriedade do recurso, com negação por padrão.
6. Validar cada payload no servidor; não confiar nos campos, IDs ou status enviados pelo navegador.

### Fase B — endurecimento e privacidade

1. Configurar cabeçalhos de segurança no ambiente de entrega. A CSP deve permitir somente as origens necessárias para o app, analytics, fontes e ativos; `frame-ancestors 'none'` deve ser revisado se não houver necessidade legítima de incorporação. [3]
2. Adicionar limitação de taxa nas rotas de login, recuperação, criação de interesse e cadastro.
3. Adotar proteção CSRF para escritas autenticadas por cookie, além de verificação de origem.
4. Minimizar dados mostrados no catálogo e separar campos internos da operação dos campos compartilháveis com Lançadores.
5. Definir retenção, exclusão e exportação de dados pessoais, consentimento e aviso de privacidade antes do onboarding real.

### Fase C — governança contínua

1. Criar testes automatizados de autorização horizontal e vertical para cada perfil.
2. Executar análise de dependências, SAST e checagem de segredos em todo pull request; falhas críticas devem bloquear a entrega.
3. Manter log de auditoria com ator, ação, recurso, antes/depois, horário e origem, sem gravar senhas, tokens ou conteúdo sensível desnecessário.
4. Revisar permissões por evento e remover acessos ao término da Rodada de Parcerias.
5. Realizar teste de intrusão antes da abertura pública com dados reais.

## 6. Decisões que preciso validar com o negócio

Antes de implementar a camada operacional, precisamos confirmar se os participantes usarão uma identidade central do ecossistema ou se haverá convite por e-mail; se os Administradores exigem MFA; quais campos podem aparecer no catálogo; por quanto tempo triagens e dados de contato devem ser retidos; e quem pode exportar dados da Rodada. Essas respostas definem a matriz de permissões, o modelo de consentimento e a retenção.

## Conclusão

O protótipo atual possui medidas básicas de entrega e foi construído para validação de fluxo, não para operação. A principal defesa para a próxima versão é manter os dados reais fora do cliente e implementar autenticação, autorização por recurso, validação no servidor e auditoria transacional. Só após esses controles a aplicação deve ser utilizada por Experts, Lançadores e Administradores reais.

## Referências

[1] [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

[2] [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

[3] [OWASP — HTTP Security Response Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
