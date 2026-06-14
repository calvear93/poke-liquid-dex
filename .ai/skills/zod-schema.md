# Skill: Zod schema design (React)

Design type-safe Zod 4 schemas for forms, API responses, and complex prop validation.

## When to use

Defining or reviewing any data shape, form validation, or runtime-validated boundary.

## Guidelines

- Co-locate schemas as `*.schema.ts`; derive types with `z.infer` — never hand-write a
  duplicate interface.
- Provide actionable messages: `z.string().min(1, 'Name is required')`.
- Use Zod 4 top-level formats: `z.email()`, `z.uuid()`, `z.iso.date()` (not the deprecated
  `z.string().email()`).
- Coerce external/string inputs at the edge: `z.coerce.number()`, `z.coerce.boolean()`.
- Derive variants instead of redefining: `.omit()` for create, `.partial()` for update,
  `.pick()` for field-level validation.
- Validate API responses with `schema.parse(...)`/`safeParse(...)` before trusting them.

## Pattern

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
	id: z.coerce.number().optional(),
	name: z.string().min(1, 'Name is required').max(100),
	email: z.email('Invalid email format'),
	isActive: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ id: true });
export type CreateUserData = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.partial();
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
```

Form validation uses Zod directly via a small hook (this template has no `react-hook-form`):
collect with `useState`, validate with `safeParse`, surface `error.issues` per field. See
`.github/instructions/patterns.instructions.md` → "Form with Zod validation".

## Lint notes

Single quotes, inline `type` imports, sorted object members (id-like first). No `any`.
