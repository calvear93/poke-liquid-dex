# Skill: Vite & environment config (React)

Work with Vite build/dev config and environment loading the way this template is set up.

## When to use

Touching `vite.config.ts`, env handling, build modes, aliases, or plugins.

## Environment loading (`@calvear/env`)

- Scripts load env via `@calvear/env` before running Vite (see `package.json` scripts:
  `env -e <env> -m <mode> : vite ...`). The project uses a single environment, `main`.
- Non-secret values live in `env/appsettings.json`; secrets in `env/<env>.env.json` /
  `env/<env>.local.env.json`. After adding a variable, run `pnpm env:schema`.
- Vite's `envPrefix` is `APP_`. Read `import.meta.env.APP_*` only in a centralized config
  layer (a small `app.config.ts` parsed with Zod) — not scattered across components/hooks.
  Then expose it through the IoC container (`ioc-binding` skill).

## vite.config.ts

- Keep plugin config declarative and minimal; this template uses `@vitejs/plugin-react`,
  UnoCSS, PWA, and webfont plugins. Add plugins through the `plugins` array.
- Path aliases come from `package.json#imports` (`#libs/ioc`, `#libs/router`,
  `#libs/feature`) — prefer adding new shared libs there over deep relative paths.
- `vitest.config.ts` holds test config (happy-dom, coverage V8); keep test concerns out of
  `vite.config.ts`.

## Lint notes

Config files follow the same ESLint contract (single quotes, inline `type` imports,
`node:` protocol for Node builtins, sorted imports). Validate env shape with Zod, not ad-hoc
`process`/`import.meta.env` reads.
