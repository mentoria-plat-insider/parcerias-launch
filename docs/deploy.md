# Deploy

Este projeto é um app full-stack: frontend em React/Vite e backend em Express + tRPC,
com Drizzle ORM sobre MySQL (via `mysql2`, conexão TCP tradicional).

## Vercel (recomendado — frontend + API)

O backend Express roda como uma única Serverless Function em Node.js.

1. Importe o repositório na Vercel.
2. A Vercel detecta `vercel.json` automaticamente:
   - `buildCommand`: `pnpm run build:client` (builda só o frontend, o backend
     é empacotado separadamente pela própria Vercel a partir de `api/index.ts`).
   - `outputDirectory`: `dist/public`.
   - Rewrites: `/api/*` vai para a função serverless; qualquer outra rota cai
     no `index.html` (SPA).
3. Configure as variáveis de ambiente do projeto na Vercel (Project Settings →
   Environment Variables), pelo menos:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `OWNER_NAME`
   - `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` (se aplicável)
4. Deploy. O runtime é Node.js (não Edge), então `mysql2` funciona normalmente.

## Cloudflare Pages (frontend estático, com proxy para a API na Vercel)

O runtime de Cloudflare Workers/Pages Functions não suporta sockets TCP
nativos (`net.Server`), então o Express + tRPC + `mysql2` **não rodam
diretamente** nesse runtime sem uma reescrita completa do backend (trocar
Express por um router compatível com Workers e o driver MySQL por um
compatível com Hyperdrive). Isso está fora do escopo desta mudança.

A configuração incluída aqui faz o Cloudflare Pages servir o build estático
do frontend e repassar (`proxy`) as chamadas de `/api/*` para a API já
publicada na Vercel:

1. `wrangler.toml` já aponta `pages_build_output_dir = "dist/public"`.
2. `client/public/_redirects` contém as regras de proxy/SPA fallback. **Antes
   do deploy**, edite esse arquivo e troque `VERCEL_API_DOMAIN` pelo domínio
   real do deploy na Vercel (ex: `parcerias-launch.vercel.app`).
3. Build e deploy local (ou via CI):
   ```bash
   pnpm run deploy:cloudflare
   ```
   Isso builda o cliente e publica com `wrangler pages deploy dist/public`.
4. Ou conecte o repositório direto no dashboard do Cloudflare Pages, com:
   - Build command: `pnpm run build:client`
   - Build output directory: `dist/public`

### Evoluindo para backend real no Cloudflare (opcional, trabalho futuro)

Se no futuro for necessário rodar a API também em Workers (sem depender da
Vercel), o caminho é:
- Reescrever as rotas Express/tRPC para um router compatível com Workers
  (ex: Hono).
- Trocar a conexão MySQL por [Cloudflare Hyperdrive](https://developers.cloudflare.com/hyperdrive/)
  (que dá suporte a `mysql2` sobre TCP via Hyperdrive, mas exige ajustes na
  string de conexão e nos bindings do Worker).

## Desenvolvimento local (sem mudanças)

Continua igual:

```bash
pnpm run dev     # servidor Express + Vite dev server
pnpm run build   # build completo (client + bundle do servidor Node)
pnpm start       # roda o build em produção (Node tradicional)
```
