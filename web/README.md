# BookQubit Web

Next.js app for BookQubit, configured for Cloudflare Workers deployment through the OpenNext Cloudflare adapter.

## Cloudflare Deployment

This app is prepared for Cloudflare's current Next.js flow:

- Adapter: `@opennextjs/cloudflare`
- Runtime config: `wrangler.jsonc`
- OpenNext config: `open-next.config.ts`
- Generated output: `.open-next/`

Recommended Cloudflare Git settings:

- Root directory: `web`
- Install command: `npm ci`
- Deploy command: `npm run deploy`
- Node.js version: use Cloudflare's current default supported Node version, or set `NODE_VERSION` to a current LTS version if your Cloudflare build image requires it.

Useful local commands:

```bash
npm run dev
npm run cf:build
npm run preview
npm run deploy
npm run cf-typegen
```

`npm run deploy` builds the Next.js app with OpenNext and deploys it with Wrangler. Do not run it locally unless you intend to deploy from your machine.

## Notes

- Cloudflare requires the `nodejs_compat` compatibility flag for this Next.js adapter.
- Static assets are served from `.open-next/assets` through the `ASSETS` binding.
- `.open-next/`, `.wrangler/`, and generated Cloudflare type files are ignored by Git.
