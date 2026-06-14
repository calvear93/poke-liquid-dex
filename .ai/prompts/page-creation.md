# React Page Creation Prompt

Create a new React page component for [PAGE_DESCRIPTION] following these requirements.

Follow `AGENTS.md` and `.github/instructions/{architecture-guide,patterns}.instructions.md`. The points below are page-specific.

## Core Requirements

### 1. Page Structure

- Use the `.page.tsx` suffix; type as `React.FC`. Keep data/business logic in custom hooks.
- Import routing primitives from `#libs/router` (React Router 7); lazy-load routes. Wrap in a layout component.

### 2. Data & state

- Type route params: `useParams<{ id: string }>()`. Get services/config via `useInjection(...)` from the relative `app.ioc.ts` (never hardcode config).
- Handle loading, error, and success states; manage URL state and navigation.

### 3. User experience

- Document title / SEO; responsive; accessible (semantic HTML, ARIA, keyboard).
- Loading indicators and an error boundary; handle auth/authorization where relevant.

### 4. Error handling

- Surface meaningful messages (catch param `error`); handle network/timeout failures; offer retry where useful.

## Implementation Patterns

### Basic Page Template

```tsx
import { type FC } from 'react';
import { useNavigate, useParams } from '#libs/router';
import { AppLayout } from '../layouts/app.layout.tsx';

/**
 * [page description explaining purpose and functionality]
 * handles [specific features] with proper error handling and loading states.
 */
export const PageName: FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	// page implementation
	return <AppLayout>{/* page content */}</AppLayout>;
};
```

### Page with Data Fetching

```tsx
import { type FC, useEffect, useState } from 'react';
import { useParams } from '#libs/router';
import { useInjection } from '../app.ioc.ts';
import { AppLayout } from '../layouts/app.layout.tsx';
import { HttpClient } from '../services/http-client.service.ts';
import { type User } from './user.schema.ts';

export const UserPage: FC = () => {
	const { id } = useParams<{ id: string }>();
	const httpClient = useInjection(HttpClient);

	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				setIsLoading(true);
				setError(null);
				setUser(await httpClient.get<User>(`/users/${id}`));
			} catch (error) {
				setError(
					error instanceof Error
						? error.message
						: 'failed to load user',
				);
			} finally {
				setIsLoading(false);
			}
		};

		if (id) void fetchUser();
	}, [id, httpClient]);

	if (isLoading) return <LoadingSpinner />;
	if (error) return <ErrorMessage error={error} />;
	if (!user) return <NotFound />;

	return (
		<AppLayout>
			<UserProfile user={user} />
		</AppLayout>
	);
};
```

### Page with Form Handling

```tsx
import { type FC, useState } from 'react';
import { useNavigate } from '#libs/router';
import { z } from 'zod';
import { useInjection } from '../app.ioc.ts';
import { HttpClient } from '../services/http-client.service.ts';

const FormSchema = z.object({
	title: z.string().min(1, 'title is required'),
	description: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export const CreateItemPage: FC = () => {
	const navigate = useNavigate();
	const httpClient = useInjection(HttpClient);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true);
			setError(null);

			const item = await httpClient.post<{ id: string }>('/items', data);
			navigate(`/items/${item.id}`);
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: 'failed to create item',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AppLayout>
			<CreateItemForm
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				error={error}
			/>
		</AppLayout>
	);
};
```

## Technical Checklist

- [ ] `.page.tsx` suffix; typed via `React.FC`; wrapped in a layout
- [ ] Typed `useParams`; navigation via `useNavigate`; routing primitives from `#libs/router`
- [ ] Services/config via `useInjection` (no hardcoded values); data/logic in custom hooks
- [ ] Loading/error/success states; error boundary; Zod for form validation
- [ ] Document title / SEO; responsive; accessible (ARIA, semantic HTML, keyboard)
- [ ] Auth/authorization handled where relevant; no sensitive data leaked
- [ ] Lazy-loaded route; effects cleaned up
- [ ] Tests cover render, data fetching, interactions, and error states

## Navigation Patterns

### Route Configuration

Register the page in `app.routes.tsx` as a lazy route (see **architecture-guide**):

```tsx
import { lazy } from 'react';

const UserPage = lazy(async () => import('./pages/user.page.tsx'));

// inside the routes array
{
	path: '/users/:id',
	element: <UserPage />,
	errorElement: <ErrorBoundary />,
}
```

### Protected Routes

```tsx
import { type FC, useEffect } from 'react';
import { useNavigate } from '#libs/router';
import { AppLayout } from '../layouts/app.layout.tsx';
import { useAuth } from '../hooks/use-auth.ts';

export const ProtectedPage: FC = () => {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) navigate('/login', { replace: true });
	}, [isAuthenticated, navigate]);

	if (!isAuthenticated) return <LoadingSpinner />;

	return <AppLayout>{/* protected content */}</AppLayout>;
};
```

Generate the page component following these patterns and ensure it integrates seamlessly with the existing architecture and routing system.
