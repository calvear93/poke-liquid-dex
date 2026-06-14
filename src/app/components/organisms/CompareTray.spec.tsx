import { cleanup, screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { afterEach, describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../__tests__/render.tsx';
import { compareAtom } from '../../store/compare.atom.ts';
import { CompareTray } from './CompareTray.tsx';

describe('CompareTray', () => {
	afterEach(cleanup);

	test('shows the selected count and avatars', () => {
		const store = createStore();
		store.set(compareAtom, [1, 4]);

		renderWithProviders(<CompareTray />, { store });

		expect(
			screen.getByRole('button', { name: 'Comparar (2)' }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Vaciar comparación' }),
		).toBeInTheDocument();
	});
});
