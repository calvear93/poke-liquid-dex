import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';
import { useHashValue } from './router.hook.ts';

describe('router hooks', () => {
	// tests
	test('useHashValue returns current path hash', () => {
		const expected = 'myHash';

		const { result } = renderHook(useHashValue, {
			wrapper: ({ children }) => (
				<MemoryRouter initialEntries={[`/path#${expected}`]}>
					{children}
				</MemoryRouter>
			),
		});

		expect(result.current).toBe(expected);
	});
});
