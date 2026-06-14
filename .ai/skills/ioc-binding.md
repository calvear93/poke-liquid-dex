# Skill: IoC binding & injection (React)

Wire services and configuration through this template's custom IoC container instead of
hardcoding or importing singletons directly.

## When to use

Adding a service/config dependency, consuming one in a component/hook, or mocking one in tests.

## Guidelines

- The container is created once in `src/app/app.ioc.ts` via `createContainer()` from
  `#libs/ioc`, exposing `container`, `useInjection`, and `InversionOfControlProvider`.
- **Bind in the bootstrap layer** (`app.ioc.ts`) — config and services as far out as possible.
- **Consume with `useInjection(token)`** inside hooks/components; import it from the relative
  path to `app.ioc.ts` (e.g. `../app.ioc.ts`), since it is app code, not a `#libs/*` library.
- Never hardcode URLs/keys; never read `import.meta.env` scattered through components — keep
  env access centralized (see `vite-config` skill and `AGENTS.md`).
- Prefer interface + concrete pairs for services so tests can substitute a mock.

## Bind (bootstrap)

```typescript
// src/app/app.ioc.ts
import { createContainer } from '#libs/ioc';

export const { container, InversionOfControlProvider, useInjection } =
	createContainer();

container.bind(HttpClient, new HttpClient(/* injected config */));
container.bind(UserService, new UserService());
```

## Consume (hook)

```typescript
import { useInjection } from '../app.ioc.ts';
import { UserService } from '../services/user.service.ts';

const userService = useInjection(UserService);
```

## Test (override)

Render under `InversionOfControlProvider` with a `mockIoCValues` Map keyed by the injection
token (do NOT use MSW; this template mocks via IoC):

```typescript
const mockIoCValues = new Map();
mockIoCValues.set(UserService, mockUserService);

render(
	<InversionOfControlProvider values={mockIoCValues}>
		<UserCard user={user} />
	</InversionOfControlProvider>,
);
```

See `.github/instructions/architecture-guide.instructions.md` → IoC wiring.
