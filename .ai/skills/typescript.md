# Skill: TypeScript (React template)

The TypeScript conventions this template's ESLint (`typescript-eslint` + `perfectionist` +
`unicorn` + `sonarjs` + `react`) and Prettier enforce. These are expectations — fix violations
before code is considered done. Deep rules: **[AGENTS.md](../../AGENTS.md)** → _Code style_.

## When to use

Writing or reviewing any `.ts` / `.tsx` in this repository.

## Types

- **Strict everywhere.** `tsconfig` runs `strict: true` — never relax it locally.
- **No `any`.** Use `unknown` + narrowing (type guards, `in`, `instanceof`, discriminated
  unions). Reach for a precise type before a cast; avoid `as` except at trusted boundaries.
- **Explicit public surface.** Annotate exported function params, return types and **component
  props**; let inference handle locals.
- **Model with the type system:** discriminated unions for variants, `as const` for literals,
  `satisfies` to check a value against a type without widening it.
- **Reuse via utility types** — `Partial` · `Required` · `Pick` · `Omit` · `Record` ·
  `Readonly` · `ComponentProps` · `ReturnType` · `Awaited` — instead of re-declaring shapes;
  mapped & template-literal types for derived shapes.
- Runtime/external input is validated with **Zod** and the type is **inferred** (`z.infer`) —
  never hand-write a parallel interface for a schema. See the `zod-schema` skill.
- Prefer an `as const` object + union (or a Zod enum) over a TypeScript `enum`.

## Imports & modules

- Order (perfectionist, auto-fixable): external packages → `#`-aliases (`#libs/*`, `#app/*`,
  `#utils/*`) → relative.
- **Type-only imports:** `import type { Foo } from '...'` (kept out of the JS output).
- Relative imports include the file extension (`.ts` / `.tsx`); aliases and node_modules do not.
- Named exports over default exports (including components).

## Naming & style (Prettier + ESLint)

- Files `kebab-case` (components `*.Component.tsx` / pages `*.page.tsx` per the scaffolds);
  components/types/interfaces `PascalCase`; functions/vars/hooks `camelCase` (`useX`); module
  constants `SCREAMING_SNAKE_CASE`; private members prefixed `_`.
- Tabs (width 4), single quotes, semicolons, trailing commas (all), ~80 col.
- Arrow functions with parens around params; `async`/`await` over raw `.then()` chains, always
  handling the error path.

## Anti-patterns (lint-flagged)

- `any`; non-null `!` on untrusted values; `// @ts-ignore` (use `// @ts-expect-error <reason>`).
- Re-declaring a type that already exists (derive it with a utility type).
- Unused vars/params — prefix intentional ones with `_`.

```typescript
type UserCardProps = {
	user: User;
	onSelect?: (id: number) => void;
};

export const UserCard = ({ user, onSelect }: UserCardProps) => (
	<button type='button' onClick={() => onSelect?.(user.id)}>
		{user.name}
	</button>
);
```
