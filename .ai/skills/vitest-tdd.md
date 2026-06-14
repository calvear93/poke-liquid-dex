# Skill: Vitest TDD (React)

Drive implementation test-first with Vitest + React Testing Library, the way this template's
ESLint (`vitest`, `testing-library`, `jest-dom`) expects.

## When to use

Writing or reviewing any test; implementing a task in the SDD loop.

## Red → green → refactor

1. **Red:** write the test for the next acceptance criterion; run `pnpm test --run` and
   see it fail for the right reason.
2. **Green:** implement the minimum to pass.
3. **Refactor:** clean up while green. Keep assertions meaningful (mutation-aware).

## React Testing Library rules (lint-enforced)

- Query through `screen` — `getBy*` (must exist), `queryBy*` (may be absent), `findBy*`
  (async). Never destructure `container` or use `container.querySelector` /
  `node.firstChild` (`no-container` / `no-node-access` are errors).
- Async UI uses `findBy*` (not `waitFor(() => getBy*)`).
- User interactions via `userEvent.setup()` and `await user.click(...)` / `user.type(...)`.
- Assert with jest-dom matchers: `toBeInTheDocument()`, `toBeChecked()`, `toBeDisabled()`.
- Mock dependencies through the IoC container (`InversionOfControlProvider` + `mockIoCValues`
  Map) — see the `ioc-binding` skill. No MSW.
- Test files: `*.spec.tsx` / `*.spec.ts`, co-located with source.

## Shape

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserCard } from './UserCard.tsx';

describe('UserCard', () => {
	const user = { id: 1, name: 'John Doe', email: 'john@example.com', isActive: true };

	it('calls onEdit when the edit button is clicked', async () => {
		const onEdit = vi.fn();
		const ui = userEvent.setup();

		render(<UserCard user={user} onEdit={onEdit} />);
		await ui.click(screen.getByRole('button', { name: /edit/i }));

		expect(onEdit).toHaveBeenCalledWith(user);
	});
});
```

Cover happy path + loading/error + ≥ 1 edge case. Target ≥ 80% coverage; use
`pnpm test:mutation` to validate test strength on critical logic. Full recipes:
`.github/instructions/patterns.instructions.md` → Testing patterns.
