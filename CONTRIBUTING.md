# Contribuindo com o FL Insider

## Princípios

As alterações devem preservar a triagem manual, a separação de papéis e a privacidade dos participantes. Não introduza matching automático, pontuação de aderência, dados reais de exemplo ou controles de autorização exclusivamente no cliente sem validação explícita do responsável pelo produto.

## Fluxo de contribuição

1. Abra uma issue para registrar contexto, impacto e critério de aceite.
2. Crie uma branch com escopo curto e nome descritivo, por exemplo `feat/login-magico` ou `fix/conflito-agenda`.
3. Atualize testes e documentação quando a regra de negócio, o contrato ou a operação forem afetados.
4. Execute as verificações locais antes de abrir o pull request.
5. Descreva no pull request o comportamento alterado, os testes executados e qualquer migração ou variável de ambiente necessária.

```bash
pnpm test
pnpm run check
pnpm audit --prod
pnpm build
```

## Regras para banco de dados

- Atualize `drizzle/schema.ts` antes de gerar uma migração.
- Revise a migração SQL gerada e aplique-a por processo controlado.
- Evite alterações destrutivas em tabelas com dados operacionais sem plano de reversão e validação da equipe responsável.

## Dados e segredos

Não inclua nomes, e-mails, telefones, links privados, dumps de banco, tokens, chaves ou arquivos `.env` em commits, issues ou pull requests. Utilize registros demonstrativos já identificados para cenários de teste.

## Revisão mínima

Uma alteração que toque autenticação, autorização, dados pessoais, migrações ou agenda deve receber revisão técnica independente antes de chegar à branch principal.

