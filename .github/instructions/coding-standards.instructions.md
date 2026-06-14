---
applyTo: 'src/**/*.{ts,cts,mts,tsx}'
description: 'TypeScript & React code style: formatting, naming, suffixes, comments, anti-patterns'
---

# Coding Standards

Deep reference for **how a line of code should look**. High-level rules are in
[AGENTS.md](../../AGENTS.md); structure/wiring is in [architecture-guide](architecture-guide.instructions.md);
worked recipes are in [patterns](patterns.instructions.md). This document does not repeat those.

## Formatting

- **Indentation:** tabs, width 4 (never spaces).
- **Line length:** ~80 characters; break long lines.
- **Quotes:** single quotes.
- **Semicolons:** always.
- **Trailing commas:** in all multi-line constructs.
- **Arrow params:** always parenthesized — `(x) => ...`.
- **Bracket spacing:** spaces inside object braces; closing bracket on its own line.
- **Complexity:** max cyclomatic complexity 15; avoid magic numbers (use named constants).
- **Cleanliness:** remove unused imports/vars; prefer `const`; never `var`.

## Naming conventions

### Classes, interfaces, types, enums — PascalCase

```typescript
export const UserCard: React.FC = () => {};
export interface UserData {}
export type UserRole = 'admin' | 'user';

// PascalCase enum, SCREAMING_SNAKE_CASE members; prefer const enum for performance
const enum UserStatus {
	ACTIVE,
	INACTIVE,
	PENDING_VERIFICATION,
}
```

### Methods, variables, properties — camelCase; private members `_`-prefixed

```typescript
const userData = {};
const isUserActive = true;

class UserService {
	private _repository: UserRepository;
	private _validateInput() {}
}
```

Avoid `#` private fields — use the `private` modifier for better introspection.

### Constants — SCREAMING_SNAKE_CASE

```typescript
const MAX_RETRY_ATTEMPTS = 3;
const EARTH_RADIUS_KM = 6_371;
// NOTE: never hardcode environment-specific URLs — inject them via config.
```

### Booleans — meaningful prefixes (`is`, `has`, `can`, `are`)

```typescript
const isEnabled = false;
const hasAccess = true;
const canEdit = true;

// avoid negative names (isNotEnabled) except as a deliberate optimization
```

### Files & directories — kebab-case

`user-card.tsx`, `use-user.hook.ts`, `auth-guard.spec.ts`, `user-management/`.

## File suffixes

| Suffix          | Purpose                | Example                |
| --------------- | ---------------------- | ---------------------- |
| `.tsx`          | React component        | `UserCard.tsx`         |
| `.page.tsx`     | Page component         | `User.page.tsx`        |
| `.layout.tsx`   | Layout component       | `App.layout.tsx`       |
| `.provider.tsx` | React context provider | `Feature.provider.tsx` |
| `.hook.ts`      | Custom hook            | `use-user.hook.ts`     |
| `.atom.ts`      | Jotai state atom       | `user.atom.ts`         |
| `.service.ts`   | Service / API client   | `user.service.ts`      |
| `.schema.ts`    | Zod validation schema  | `user.schema.ts`       |
| `.type.ts`      | Type definitions       | `user.type.ts`         |
| `.config.ts`    | Configuration objects  | `app.config.ts`        |
| `.utils.ts`     | Utility functions      | `string.utils.ts`      |
| `.constants.ts` | Shared constants       | `router.constants.ts`  |
| `.spec.ts(x)`   | Unit/component tests   | `user.service.spec.ts` |

## TypeScript rules

### Explicit types; interfaces for objects, type aliases for unions

```typescript
interface UserConfig {
	readonly apiKey: string;
	timeout: number;
}

type UserRole = 'admin' | 'user' | 'moderator';
type UserId = string;
```

Always type function parameters and return types. Never `any` — prefer `unknown` + narrowing.

### Prefer arrow functions and inline typing

```typescript
// ✅ prefer
const sum = (n1: number, n2: number) => n1 + n2;
export type SumFn = typeof sum;

// ❌ avoid separate type annotation when inference is clear
const sum: (n1: number, n2: number) => number = (n1, n2) => n1 + n2;
```

### Default params over post-assignment; optional over `| undefined`

```typescript
// ✅
const greet = (name = 'world') => `hello ${name}`;
const find = (id?: string) => {};

// ❌
const greet = (name: string | undefined) => `hello ${name || 'world'}`;
```

### Parameter objects for more than 3 arguments

```typescript
interface ProcessUserInput {
	id: number;
	name: string;
	email: string;
	age: number;
}

const processUser = ({ id, name, email, age }: ProcessUserInput) => {};
```

### Nullish coalescing & assignment

```typescript
const value = maybe ?? 'default'; // not `maybe || 'default'`
config.timeout ??= 10000;
```

## React component structure order

Inside a component, follow a consistent order:

```typescript
export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
	// 1. state and refs
	const [isLoading, setIsLoading] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	// 2. hooks and injected dependencies
	const userService = useInjection(UserService);

	// 3. effects
	useEffect(() => {}, []);

	// 4. event handlers
	const handleEdit = useCallback(() => onEdit?.(user), [onEdit, user]);

	// 5. computed values
	const isEditable = useMemo(() => Boolean(onEdit), [onEdit]);

	// 6. render
	return <div ref={cardRef}>{/* ... */}</div>;
};
```

## Comments

### Inline — lowercase (except proper nouns/acronyms), single leading space

```typescript
const userData = {}; // user information object
const jwtToken = '...'; // JWT authentication token
// never leave a blank line directly after a single-line comment
```

### Anchor comments

```typescript
// TODO: #123456 add case-insensitive support
// FIXME: #123457 handle empty lists
// NOTE: this requires special attention
// SECTION: hooks
```

### JSDoc — main description starts uppercase; tags/params lowercase

```typescript
/**
 * Creates a new user in the system.
 *
 * @param userData - the user data to create
 * @returns the created user
 * @throws {ValidationError} when user data is invalid
 */
```

### Meaningful over obvious

```typescript
// ❌ restates the code
this.users.push(user); // adds user to users array

// ✅ explains the why
// use exponential backoff to handle external API rate limiting
await retryWithBackoff(() => apiCall());
```

## Anti-patterns to avoid

- `any` types — always provide explicit types.
- Unhandled promises — always `await` and handle errors.
- `var`, function declarations (prefer `const` arrow functions), mixing tabs/spaces.
- Regular `enum` where `const enum` suffices.
- Non-meaningful or non-pronounceable names (`a1`, `Subs`, `ccId`).
- Redundant context in names (`Car.carModel` → `Car.model`).
- Obvious, outdated, or commented-out code (use version control instead).
- Too many positional parameters (use a parameter object).
- `||` for null coalescing (use `??`).
