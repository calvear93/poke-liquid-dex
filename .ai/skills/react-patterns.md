# Skill: React Patterns

Modern **React 19** conventions for this Vite SPA. Start from the scaffolds in
[`.vscode/__templates__/`](../../.vscode/__templates__/) and keep components small, typed and
composable. Deep rules: **[AGENTS.md](../../AGENTS.md)**.

## When to use

Writing or reviewing any component, hook, page or layout.

## Components & composition

- **Composition over props.** Pass `children` / slots and use layout components instead of
  prop-drilling or boolean-flag explosions (Donut pattern).
- **Small and focused.** One responsibility per component; extract logic into custom hooks
  (`useX`) and keep JSX declarative.
- **Type the props** explicitly (`type XProps = { … }`); no `any`. See the `typescript` skill.

## Hooks

- Call hooks at the top level, unconditionally; name custom hooks `useX`.
- **Effects are for external sync only** (subscriptions, non-React widgets, imperative APIs) —
  never for state you can derive during render or compute in an event handler.
- **Don't hand-roll memoization.** The React Compiler memoizes automatically; reach for
  `useMemo`/`useCallback`/`memo` only when profiling proves a hot path.
- Forms & async UI: prefer `useActionState`, `useOptimistic` and the `use()` API over manual
  loading/error/optimistic bookkeeping.

## State

- **Local UI state** with `useState` / `useReducer`.
- **Shared / app state** with **Jotai atoms** — derived atoms for computed values, async atoms
  for data fetching; inject services through the IoC container (see the `ioc-binding` skill).
- Avoid global mutable singletons and unnecessary Context providers.

## Routing & features

- **File-based routing** via `#libs/router`: lazy `Component`, `loader` for pre-fetch, nested
  layouts. Navigate with the `Link` component or `useRouter()` — not raw `history`.
- **Feature flags** via `#libs/feature` (`useFeature('FLAG')`) for controlled rollout.

## Styling

- **CSS Modules** per component (`*.module.css`); centralize design tokens; semantic HTML and
  visible focus states for accessibility.

```typescript
import { atom, useAtomValue } from 'jotai';
import { Link } from '#libs/router';

const userCountAtom = atom((get) => get(usersAtom).length);

export const Header = ({ children }: { children: ReactNode }) => {
	const count = useAtomValue(userCountAtom);
	return (
		<header>
			<Link to='/'>Inicio</Link>
			<span>{count}</span>
			{children}
		</header>
	);
};
```
