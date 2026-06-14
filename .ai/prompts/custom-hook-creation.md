# Custom Hook Creation Prompt

Create a new custom React hook for [HOOK_DESCRIPTION] following these requirements.

Follow `AGENTS.md` and `.github/instructions/{coding-standards,patterns}.instructions.md` for formatting, naming, and recipes. The points below are hook-specific.

## Core Requirements

### 1. Hook Structure & types

- Use `use` prefix (e.g., `useUserData`); follow the rules of hooks (no conditional calls).
- Type the return value (interface or tuple) and use generics for reusable hooks; inline type imports (`import { type FC, useState } from 'react'`).

### 2. State & dependencies

- Use `useState`/`useEffect`/`useCallback`/`useMemo` with correct dependency arrays; clean up effects and subscriptions.
- Handle loading, error, and success states. Get services/config via `useInjection(...)` from the relative `app.ioc.ts` (never hardcode config).

### 3. Error handling

- Surface meaningful messages; handle network/timeout errors. If logging, use `console.error`/`console.warn`.
- `throw new Error('message')` (never throw a string); name catch params `error`.

### 4. Performance

- Memoize stable references with `useMemo`/`useCallback`; avoid unnecessary re-renders.

## Implementation Patterns

### Basic Data Fetching Hook

```typescript
import { useCallback, useEffect, useState } from 'react';
import { useInjection } from '../app.ioc.ts';
import { HttpClient } from '../services/http-client.service.ts';

interface UseApiResult<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

interface UseApiOptions<T> {
	enabled?: boolean;
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
}

/**
 * Custom hook for API data fetching with loading and error states.
 * Provides automatic refetch capability and proper cleanup.
 *
 * @param url - API endpoint URL
 * @param options - Configuration options for the hook
 * @returns Object containing data, loading state, error, and refetch function
 */
export const useApi = <T>(
	url: string,
	options: UseApiOptions<T> = {},
): UseApiResult<T> => {
	const { enabled = true, onSuccess, onError } = options;
	const httpClient = useInjection(HttpClient);

	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(async () => {
		if (!enabled) return;

		try {
			setLoading(true);
			setError(null);

			const result = await httpClient.get<T>(url);
			setData(result);
			onSuccess?.(result);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'unknown error';
			setError(message);
			if (error instanceof Error) onError?.(error);
		} finally {
			setLoading(false);
		}
	}, [url, enabled, httpClient, onSuccess, onError]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const refetch = useCallback(() => fetchData(), [fetchData]);

	return { data, loading, error, refetch };
};
```

### Form Handling Hook

```typescript
interface UseFormOptions<T> {
	initialValues: T;
	validationSchema: z.ZodSchema<T>;
	onSubmit: (values: T) => Promise<void>;
}

interface UseFormResult<T> {
	values: T;
	errors: Partial<Record<keyof T, string>>;
	isSubmitting: boolean;
	handleChange: (field: keyof T, value: T[keyof T]) => void;
	handleSubmit: (e: React.FormEvent) => Promise<void>;
	reset: () => void;
	setFieldError: (field: keyof T, error: string) => void;
}

/**
 * Custom hook for form state management with Zod validation.
 * Handles form submission, validation, and error states.
 *
 * @param options - Form configuration including initial values and validation
 * @returns Form state and handlers for form management
 */
export const useForm = <T extends Record<string, unknown>>({
	initialValues,
	validationSchema,
	onSubmit,
}: UseFormOptions<T>): UseFormResult<T> => {
	const [values, setValues] = useState<T>(initialValues);
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validateField = useCallback(
		(field: keyof T, value: T[keyof T]) => {
			const result = validationSchema.safeParse({
				...values,
				[field]: value,
			});

			if (result.success) {
				setErrors((prev) => ({ ...prev, [field]: undefined }));
				return true;
			}

			const issue = result.error.issues.find(
				(item) => item.path[0] === field,
			);
			setErrors((prev) => ({ ...prev, [field]: issue?.message }));
			return false;
		},
		[validationSchema, values],
	);

	const handleChange = useCallback(
		(field: keyof T, value: T[keyof T]) => {
			setValues((prev) => ({ ...prev, [field]: value }));
			validateField(field, value);
		},
		[validateField],
	);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();

			try {
				setIsSubmitting(true);
				validationSchema.parse(values);
				await onSubmit(values);
			} catch (error) {
				if (error instanceof z.ZodError) {
					const fieldErrors: Partial<Record<keyof T, string>> = {};
					for (const issue of error.issues) {
						const field = issue.path[0];
						if (field) {
							fieldErrors[field as keyof T] = issue.message;
						}
					}
					setErrors(fieldErrors);
				}
			} finally {
				setIsSubmitting(false);
			}
		},
		[values, validationSchema, onSubmit],
	);

	const reset = useCallback(() => {
		setValues(initialValues);
		setErrors({});
		setIsSubmitting(false);
	}, [initialValues]);

	const setFieldError = useCallback((field: keyof T, error: string) => {
		setErrors((prev) => ({ ...prev, [field]: error }));
	}, []);

	return {
		values,
		errors,
		isSubmitting,
		handleChange,
		handleSubmit,
		reset,
		setFieldError,
	};
};
```

### Local Storage Hook

```typescript
/**
 * Custom hook for localStorage state management with TypeScript support.
 * Automatically syncs state with localStorage and handles serialization.
 *
 * @param key - localStorage key
 * @param initialValue - Initial value if no stored value exists
 * @returns Tuple of [value, setValue] similar to useState
 */
export const useLocalStorage = <T>(
	key: string,
	initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] => {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = globalThis.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	const setValue = useCallback(
		(value: T | ((val: T) => T)) => {
			try {
				const valueToStore =
					value instanceof Function ? value(storedValue) : value;
				setStoredValue(valueToStore);
				globalThis.localStorage.setItem(
					key,
					JSON.stringify(valueToStore),
				);
			} catch (error) {
				console.error(
					`Error setting localStorage key "${key}":`,
					error,
				);
			}
		},
		[key, storedValue],
	);

	return [storedValue, setValue];
};
```

### Debounced Value Hook

```typescript
/**
 * Custom hook for debouncing values to optimize performance.
 * Useful for search inputs and API calls triggered by user input.
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};
```

### Hook Testing with IoC Dependencies

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { type FC, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { InversionOfControlProvider } from '../app.ioc.ts';
import { HttpClient } from '../services/http-client.service.ts';
import { useApiData } from './use-api-data.ts';

describe('useApiData with IoC', () => {
	it('should fetch data using injected http client', async () => {
		const mockHttpClient = {
			get: vi.fn().mockResolvedValue({ data: 'test data' }),
		};

		// mock ioc container dependencies (key by the injection token)
		const mockIoCValues = new Map();
		mockIoCValues.set(HttpClient, mockHttpClient);

		const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
			<InversionOfControlProvider values={mockIoCValues}>
				{children}
			</InversionOfControlProvider>
		);

		const { result } = renderHook(() => useApiData('/api/test'), {
			wrapper,
		});

		await waitFor(() => {
			expect(result.current.data).toEqual({ data: 'test data' });
		});
		expect(mockHttpClient.get).toHaveBeenCalledWith('/api/test');
	});
});
```

## Technical Checklist

- [ ] `use` prefix; follows rules of hooks (no conditional calls)
- [ ] Typed return (interface/tuple) and generics for reusability; JSDoc on params
- [ ] Correct dependency arrays; effects/subscriptions cleaned up; stable refs via `useMemo`/`useCallback`
- [ ] Services/config via `useInjection` (no hardcoded values)
- [ ] Error path handled with meaningful messages (`throw new Error(...)`, catch param `error`)
- [ ] Tests cover initial state, success, error, and dependency changes; IoC mocked via `InversionOfControlProvider`; assert with `waitFor`/`findBy*`

Generate the custom hook following these patterns and ensure it integrates seamlessly with the existing architecture.
