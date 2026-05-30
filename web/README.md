# BookQubit Web

Next.js app for BookQubit, configured for Cloudflare Workers deployment through the OpenNext Cloudflare adapter.

## Cloudflare Deployment

Use these Cloudflare Git settings:

- Root directory: `web`
- Install command: `npm ci`
- Deploy command: `npm run deploy`

Do not set the deploy command to `wrangler deploy` directly. Wrangler can detect OpenNext and call `opennextjs-cloudflare deploy`, but that path expects the OpenNext build output to already exist. This repo's `npm run deploy` script runs the OpenNext build first, then deploys the generated Worker.

## Scripts

```bash
npm run dev
npm run cf:build
npm run preview
npm run deploy
npm run cf-typegen
```

- `cf:build`: builds the Next.js app into Cloudflare's `.open-next/` output.
- `preview`: builds and previews the app in the Cloudflare runtime.
- `deploy`: builds with OpenNext, then runs `wrangler deploy`.

## Cloudflare Files

- `wrangler.jsonc`: Worker name, entrypoint, asset binding, compatibility date, and `nodejs_compat`.
- `open-next.config.ts`: OpenNext Cloudflare adapter config.
- `.open-next/`, `.wrangler/`, and generated Cloudflare type files are ignored by Git.
