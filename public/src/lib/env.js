// Which deployment this build is for. Set by `npm run deploy:dev` (see
// scripts/deploy-dev.mjs) and inlined at build time; unset means production, so
// nothing here changes how the live site behaves.
//
// A function, not a constant, so tests (and any future per-request use) read the
// current value instead of whatever it was when the module first loaded.
export const isDevEnv = () => process.env.NEXT_PUBLIC_APP_ENV === "dev";
