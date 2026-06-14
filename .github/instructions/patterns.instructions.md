---
applyTo: 'src/**/*.{ts,tsx,cts,mts}'
description: 'Copy-paste recipes: components, hooks, services, schemas, forms, errors, tests'
---

# Patterns

Worked recipes that follow this template's real stack (custom IoC, Jotai, Zod, React
Router via `#libs/*`, Vitest + React Testing Library). High-level rules live in
[AGENTS.md](../../AGENTS.md); wiring in [architecture-guide](architecture-guide.instructions.md); style in
[coding-standards](coding-standards.instructions.md). This document is the place for long worked examples.

## Schema validation (Zod)

```typescript
// pages/user/schemas/user.schema.ts
import { z } from 'zod';

export const UserSchema = z.object({
	id: z.coerce.number().optional(),
	name: z.string().min(1, 'Name is required').max(100),
	email: z.email('Invalid email format'),
	isActive: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

// create: drop server-generated fields
export const CreateUserSchema = UserSchema.omit({ id: true });
export type CreateUserData = z.infer<typeof CreateUserSchema>;

// update: everything optional
export const UpdateUserSchema = UserSchema.partial();
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
```

## Service

Services receive their dependencies (e.g. the configured HTTP client) rather than reading
config directly. Bind them in `app.ioc.ts`.

```typescript
// services/user.service.ts
import type { HttpClient } from './http.client.ts';
import type {
	CreateUserData,
	UpdateUserData,
	User,
} from '../schemas/user.schema.ts';

export class UserService {
	constructor(private readonly _http: HttpClient) {}

	getUser(id: number): Promise<User> {
		return this._http.get(`/users/${id}`);
	}

	createUser(data: CreateUserData): Promise<User> {
		return this._http.post('/users', data);
	}

	updateUser(id: number, data: UpdateUserData): Promise<User> {
		return this._http.patch(`/users/${id}`, data);
	}
}
```

## Custom hook (data fetching via injected service)

```typescript
// hooks/use-user.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { useInjection } from '../app.ioc.ts'; // adjust path to app.ioc.ts
import { UserService } from '../services/user.service.ts';
import type { User } from '../schemas/user.schema.ts';

export const useUser = (userId?: number) => {
	const userService = useInjection(UserService);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUser = useCallback(
		async (id: number) => {
			setIsLoading(true);
			setError(null);
			try {
				setUser(await userService.getUser(id));
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
			} finally {
				setIsLoading(false);
			}
		},
		[userService],
	);

	useEffect(() => {
		if (userId) fetchUser(userId);
	}, [userId, fetchUser]);

	return { user, isLoading, error, refetch: fetchUser };
};
```

## Component

```typescript
// components/user/UserCard.tsx
import React, { useCallback } from 'react';
import type { User } from '../../schemas/user.schema.ts';
import styles from './UserCard.module.css';

interface UserCardProps {
	/** user data to display */
	user: User;
	/** called when the edit action is triggered */
	onEdit?: (user: User) => void;
	/** loading state */
	isLoading?: boolean;
}

/**
 * Displays user information with an optional edit action.
 */
export const UserCard: React.FC<UserCardProps> = ({
	user,
	onEdit,
	isLoading = false,
}) => {
	const handleEdit = useCallback(() => onEdit?.(user), [onEdit, user]);

	if (isLoading) return <div className={styles.loading}>Loading…</div>;

	return (
		<div className={styles.card}>
			<h2 className={styles.title}>{user.name}</h2>
			<p>{user.email}</p>
			{onEdit && (
				<button type="button" onClick={handleEdit} aria-label="Edit user">
					Edit
				</button>
			)}
		</div>
	);
};
```

## Page

```typescript
// pages/user/User.page.tsx
import React from 'react';
import { useParams } from '#libs/router';
import { useUser } from './hooks/use-user.hook.ts';
import { UserCard } from './components/UserCard.tsx';
import styles from './User.page.module.css';

export const UserPage: React.FC = () => {
	const { userId } = useParams<{ userId: string }>();
	const { user, isLoading, error } = useUser(
		userId ? Number.parseInt(userId, 10) : undefined,
	);

	if (isLoading) return <p>Loading…</p>;
	if (error) return <p role="alert">{error}</p>;
	if (!user) return <p role="alert">User not found</p>;

	return (
		<div className={styles.container}>
			<h1>User Profile</h1>
			<UserCard user={user} />
		</div>
	);
};
```

## Form with Zod validation (no extra form library)

The template validates with Zod directly via a small hook — no `react-hook-form`.

```typescript
// hooks/use-user-form.hook.ts
import { useCallback, useState } from 'react';
import { z } from 'zod';
import {
	CreateUserSchema,
	type CreateUserData,
} from '../schemas/user.schema.ts';

export const useUserForm = (initial: Partial<CreateUserData> = {}) => {
	const [data, setData] = useState<Partial<CreateUserData>>(initial);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validate = useCallback(() => {
		const result = CreateUserSchema.safeParse(data);
		if (result.success) {
			setErrors({});
			return result.data;
		}
		setErrors(
			Object.fromEntries(
				result.error.issues.map((i) => [String(i.path[0]), i.message]),
			),
		);
		return null;
	}, [data]);

	const setField = useCallback(
		<K extends keyof CreateUserData>(key: K, value: CreateUserData[K]) =>
			setData((prev) => ({ ...prev, [key]: value })),
		[],
	);

	return { data, errors, setField, validate };
};
```

## Error boundary

```typescript
// components/ErrorBoundary.tsx
import React from 'react';

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
	onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		this.props.onError?.(error, info);
	}

	private _reset = () => this.setState({ error: null });

	render() {
		const { error } = this.state;
		if (!error) return this.props.children;

		const Fallback = this.props.fallback;
		if (Fallback) return <Fallback error={error} reset={this._reset} />;

		return (
			<div role="alert">
				<h2>Something went wrong</h2>
				<p>{error.message}</p>
				<button type="button" onClick={this._reset}>
					Try again
				</button>
			</div>
		);
	}
}
```

## Generic reusable hooks

```typescript
// use-debounce.hook.ts
import { useEffect, useState } from 'react';

export const useDebounce = <T>(value: T, delayMs: number): T => {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(id);
	}, [value, delayMs]);
	return debounced;
};
```

```typescript
// use-media-query.hook.ts
import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		const media = globalThis.matchMedia(query);
		setMatches(media.matches);
		const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
		media.addEventListener('change', listener);
		return () => media.removeEventListener('change', listener);
	}, [query]);
	return matches;
};
```

## Accessibility: focus trap + accessible modal

```typescript
// components/Modal.tsx
import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
	isOpen: boolean;
	title: string;
	onClose: () => void;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	title,
	onClose,
	children,
}) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
		document.addEventListener('keydown', onKey);
		ref.current?.querySelector<HTMLElement>('button')?.focus();
		return () => document.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div
				ref={ref}
				className={styles.modal}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				onClick={(e) => e.stopPropagation()}
			>
				<header>
					<h2 id="modal-title">{title}</h2>
					<button type="button" aria-label="Close" onClick={onClose}>
						×
					</button>
				</header>
				{children}
			</div>
		</div>
	);
};
```

## Performance: memoization & lazy loading

```typescript
// memoize expensive derived data and stable callbacks
const processed = useMemo(
	() => items.filter((i) => i.isActive).sort((a, b) => a.priority - b.priority),
	[items],
);
const handleClick = useCallback((id: number) => select(id), [select]);

// memoize pure presentational components
const DataItem = React.memo<{ item: Item }>(({ item }) => <li>{item.name}</li>);

// lazy-load at route boundaries (see architecture-guide for the full router setup)
const AdminPanel = React.lazy(() => import('./pages/admin/Admin.page.tsx'));
```

## Testing

### Component test with injected dependencies

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InversionOfControlProvider } from '../app.ioc.ts';
import { UserCard } from './UserCard.tsx';

describe('UserCard', () => {
	// shared variables
	const user = { id: 1, name: 'John Doe', email: 'john@example.com', isActive: true };

	it('renders user information', () => {
		render(<UserCard user={user} />);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('john@example.com')).toBeInTheDocument();
	});

	it('calls onEdit when the edit button is clicked', async () => {
		const onEdit = vi.fn();
		const ui = userEvent.setup();

		render(<UserCard user={user} onEdit={onEdit} />);
		await ui.click(screen.getByRole('button', { name: /edit/i }));

		expect(onEdit).toHaveBeenCalledWith(user);
	});
});

// override IoC bindings in tests with a mock Map
const mockIoCValues = new Map();
mockIoCValues.set(UserService, mockUserService);

render(
	<InversionOfControlProvider values={mockIoCValues}>
		<UserPage />
	</InversionOfControlProvider>,
);
```

### Hook test

```typescript
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useDebounce } from './use-debounce.hook.ts';

describe('useDebounce', () => {
	it('returns the initial value immediately', () => {
		const { result } = renderHook(() => useDebounce('a', 300));
		expect(result.current).toBe('a');
	});
});
```

Use `vitest-mock-extended` (`mock<T>()`) for typed mocks and assert on user-visible
outcomes via role/text queries rather than implementation details.
