import { cleanup, screen } from '@testing-library/react';
import { createStore } from 'jotai';
import { afterEach, describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../__tests__/render.tsx';
import { compareAtom } from '../../store/compare.atom.ts';
import { Overlays } from './Overlays.tsx';

describe('Overlays', () => {
	afterEach(cleanup);

	test('renders the comparison tray for the current selection', () => {
		const store = createStore();
		store.set(compareAtom, [1, 4]);

		renderWithProviders(<Overlays />, { store });

		expect(
			screen.getByRole('button', { name: 'Comparar (2)' }),
		).toBeInTheDocument();
	});
});
