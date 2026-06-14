import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../__tests__/render.tsx';
import { AppFooter } from './AppFooter.tsx';

describe('AppFooter', () => {
	afterEach(cleanup);

	test('shows credits and the cache size estimate', async () => {
		renderWithProviders(<AppFooter />);

		expect(screen.getByText('PokéAPI')).toBeInTheDocument();
		await expect(
			screen.findByText(/Caché ~2\.0 MB/u),
		).resolves.toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Limpiar caché/u }),
		).toBeInTheDocument();
	});
});
