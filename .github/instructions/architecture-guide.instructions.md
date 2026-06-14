---
applyTo: 'src/**/*'
description: 'Folder topology, configuration/IoC wiring, routing and import conventions'
---

# Architecture Guide

Deep reference for **where code lives and how it is wired**. For the high-level rules see
[AGENTS.md](../../AGENTS.md); for code style see [coding-standards](coding-standards.instructions.md);
for copy-paste recipes see [patterns](patterns.instructions.md). This document does not repeat those.

## Top-level layout

```
src/
  app/                  feature code (pages, components, layouts, atoms) + app bootstrap
    app.config.ts       environment config layer (the only place reading import.meta.env)
    app.ioc.ts          IoC container creation + bindings (bootstrap layer)
    app.routes.tsx      route table
  libs/                 reusable libraries, each with its own README + public index.ts
    ioc/                #libs/ioc  — dependency injection
    router/             #libs/router — type-safe routing helpers
    feature/            #libs/feature — feature flags
env/                    appsettings.json (non-secret) + <env> files (secrets)
```

## Page structure pattern

Each page lives under `src/app/pages/{page-name}/`:

```
{PageName}.page.tsx           main page component
{PageName}.page.module.css    page styles
{PageName}.page.spec.tsx      page tests
components/                   page-local components ({Component}.tsx + .module.css + .spec.tsx)
atoms/                        page-local Jotai atoms ({feature}.atom.ts + .atom.spec.ts)
__mocks__/                    test mock data ({name}.mock.ts)
```

## Reusable component structure pattern

```
src/app/components/{category}/
  {ComponentName}.tsx
  {ComponentName}.module.css
  {ComponentName}.spec.tsx
  types/{component}.types.ts   (optional, component-specific types)
```

## Library structure pattern

```
src/libs/{library-name}/
  index.ts                     public API (barrel export)
  README.md                    library documentation
  {feature}.ts                 core implementation
  exceptions/                  custom errors
  react/                       React bindings (hooks, providers, HOCs)
  types/                       type definitions
  __mocks__/                   test mocks
  {library-name}.spec.ts       unit tests
```

## Configuration architecture

Centralize `import.meta.env` access in a config layer instead of scattering it across
components and hooks. Vite's `envPrefix` is `APP_` (see `vite.config.ts`). The recommended
pattern is a small `app.config.ts` that validates and parses the environment with Zod:

```typescript
// src/app/app.config.ts (recommended pattern)
import { z } from 'zod';

const AppConfigSchema = z.object({
	apiUrl: z.string().url(),
	timeout: z.coerce.number().default(10000),
	enableFeatureFlags: z.coerce.boolean().default(false),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export const appConfig = (): AppConfig =>
	AppConfigSchema.parse({
		apiUrl: import.meta.env.APP_API_URL,
		timeout: import.meta.env.APP_API_TIMEOUT,
		enableFeatureFlags: import.meta.env.APP_ENABLE_FEATURE_FLAGS,
	});
```

Environment files live under `env/`: non-secret values in `appsettings.json`, secrets in
`<env>.env.json` / `<env>.local.env.json`. After changing variables run `pnpm env:schema`.

## IoC container wiring

Create the container once in the bootstrap layer and bind config + services there. Consume
bindings with `useInjection`; provide overrides in tests with `InversionOfControlProvider`.

```typescript
// src/app/app.ioc.ts
import { createContainer } from '#libs/ioc';
import { appConfig } from './app.config.ts';
import { HttpClient } from './services/http.client.ts';

export const { container, useInjection, InversionOfControlProvider } =
	createContainer();

const config = appConfig();
container.bind('APP_CONFIG', config);
container.bind(HttpClient, new HttpClient(config.apiUrl));
```

Components import `useInjection` from the relative path to `app.ioc.ts` (e.g.
`./app.ioc.ts`, `../app.ioc.ts`), since it is app code rather than a `#libs/*` library.

## Routing architecture

Route definitions are centralized and lazy-loaded; the router is composed from a layout
shell plus the route table, all via `#libs/router`:

```typescript
// src/app/app.routes.tsx
import { lazy } from 'react';
import type { RouteObject } from '#libs/router';

const HomePage = lazy(() => import('./pages/main/Main.page.tsx'));
const UserPage = lazy(() => import('./pages/user/User.page.tsx'));

export const routes: RouteObject[] = [
	{ path: '/', element: <HomePage /> },
	{ path: '/users/:userId', element: <UserPage /> },
];
```

```typescript
// src/app/App.router.tsx
import { createBrowserRouter, RouterProvider } from '#libs/router';
import { AppLayout } from './layouts/app/App.layout.tsx';
import { routes } from './app.routes.tsx';

const router = createBrowserRouter([
	{ path: '/', element: <AppLayout />, children: routes },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
```

Use typed params (`useParams<{ userId: string }>()`) and `useNavigate` for programmatic
navigation, both from `#libs/router`.

## Feature flags

Static flags are defined in the app bootstrap; dynamic flags derive from config/runtime.
Read flags with the `useFeature` hook from `#libs/feature` and gate experimental UI with
them — never scatter raw `import.meta.env` checks through components.

## Import path conventions

- **Libraries:** path aliases — `#libs/ioc`, `#libs/router`, `#libs/feature`.
- **App code (`src/app/**`):** relative imports with explicit `.ts`/`.tsx` extensions.
- **IoC:** relative path to `app.ioc.ts` (depends on the importing file's location).
- Group imports: external packages → `#libs/*` → relative. Avoid circular dependencies;
  expose libraries through their `index.ts` barrel.

## Performance architecture

- Lazy-load pages/heavy components and split bundles at route boundaries.
- Apply `React.memo` / `useMemo` / `useCallback` only after identifying a real re-render
  cost — not preemptively. Concrete memoization/lazy recipes live in [patterns](patterns.instructions.md).
