# 🧩 `#libs/ioc` — Inversion of Control

> A tiny, type-safe dependency-injection container for React — backed by a plain `Map` and React Context. No decorators, no reflection, no runtime magic.

Bind services once in a bootstrap file, then pull them anywhere with a hook. Swap real implementations for mocks in tests by handing the provider a `Map` of values.

## ✨ Highlights

- **~80 lines, zero dependencies** — just `Map` + React Context.
- **Type-safe injection** — class tokens infer their instance type automatically.
- **Two token styles** — bind by **class** (`HttpClient`) or by **string token** (`'CONFIG'`).
- **Scoped overrides** — wrap a subtree in a provider with custom `values` (perfect for tests and Storybook).
- **Works outside React too** — `container.resolve()` for route loaders, services, and plain functions.

## 📦 API at a glance

`createContainer()` returns three things:

| Export                       | Type                         | Use it to…                                           |
| ---------------------------- | ---------------------------- | ---------------------------------------------------- |
| `container`                  | `{ bind, resolve, unbind }`  | register and read bindings (outside React)           |
| `useInjection(token)`        | hook → resolved instance     | read a dependency inside a component/hook            |
| `InversionOfControlProvider` | `React.FC<{ values?: Map }>` | scope/override bindings for a subtree (tests, mocks) |

| `container` method | Signature                | Notes                                          |
| ------------------ | ------------------------ | ---------------------------------------------- |
| `bind`             | `(token, value) => void` | stores an **already-created instance**         |
| `resolve`          | `(token) => T`           | reads a binding; infers type from class tokens |
| `unbind`           | `(token) => void`        | removes a binding                              |

> `bind` stores the value as-is — bind **instances**, not factory functions.

## 🚀 Quick start

**1. Create the container and declare tokens** (one bootstrap file):

```typescript
// app/app.ioc.ts
import { createContainer } from '#libs/ioc';
import { HttpClient } from '../services/http-client.ts';
import { ConfigService } from '../services/config.service.ts';

export const { container, useInjection, InversionOfControlProvider } =
	createContainer();

// string tokens for interface-typed services
export const CONFIG = 'config';

// bind instances
container.bind(HttpClient, new HttpClient());
container.bind(CONFIG, new ConfigService());
```

**2. Wrap the app** so scoped overrides become possible:

```tsx
// app/App.tsx
import { InversionOfControlProvider } from './app.ioc.ts';

export const App = () => (
	<InversionOfControlProvider>
		<Routes />
	</InversionOfControlProvider>
);
```

**3. Inject anywhere:**

```tsx
import { useInjection, CONFIG } from '../app/app.ioc.ts';
import { HttpClient } from '../services/http-client.ts';
import type { ConfigService } from '../services/config.service.ts';

export const UserCard = () => {
	const http = useInjection(HttpClient); //          ← inferred as HttpClient
	const config = useInjection<ConfigService>(CONFIG); // ← typed via generic

	// ...use http.get(config.apiUrl) inside a hook
};
```

## 🔑 Class tokens vs string tokens

```typescript
// Class token → instance type is inferred, no generic needed
container.bind(HttpClient, new HttpClient());
const http = useInjection(HttpClient); // HttpClient

// String token → pass the type as a generic (interfaces have no runtime value)
export const LOGGER = 'logger';
container.bind(LOGGER, new ConsoleLogger());
const logger = useInjection<Logger>(LOGGER); // Logger
```

Prefer **class tokens** when a concrete class exists; reach for **string tokens** when you bind against an interface or want to swap implementations freely.

## 🍳 Recipes

### Environment-specific bindings

```typescript
// app/app.ioc.ts
container.bind(
	CONFIG,
	import.meta.env.DEV ? new DevConfigService() : new ProdConfigService(),
);
```

### Resolve outside React (route loaders, plain functions)

```typescript
import { container } from '../app/app.ioc.ts';
import { UserService } from '../services/user.service.ts';

export const userLoader = async ({ params }) => {
	const users = container.resolve(UserService);
	return users.byId(params.id);
};
```

### Feature-driven implementation swap

```typescript
import { container, API } from '../app/app.ioc.ts';

container.bind(API, useNewApi ? new NewApiClient() : new LegacyApiClient());
```

## 🧪 Testing — scoped overrides

The provider accepts a `values` map. When provided, the subtree resolves **only** from that map (the global container is bypassed), so list every dependency the tree needs:

```tsx
import { render } from '@testing-library/react';
import { InversionOfControlProvider, CONFIG } from '../app/app.ioc.ts';
import { HttpClient } from '../services/http-client.ts';
import { mock } from 'vitest-mock-extended';

it('renders the user name', () => {
	const mockIoCValues = new Map<unknown, unknown>([
		[HttpClient, mock<HttpClient>({ get: async () => ({ name: 'Ada' }) })],
		[CONFIG, { apiUrl: '/api' }],
	]);

	render(
		<InversionOfControlProvider values={mockIoCValues}>
			<UserCard />
		</InversionOfControlProvider>,
	);
});
```

## 🧠 How it works

`createContainer()` closes over a single `Map`. `bind`/`resolve`/`unbind` are thin `Map` operations. `InversionOfControlProvider` publishes a `Map` through React Context (`useMemo`-stabilized): with no `values`, it shares the global container; with `values`, it isolates a fresh map. `useInjection` reads the nearest provider's map, falling back to the global container when rendered outside a provider — which is why components keep working in isolation.
