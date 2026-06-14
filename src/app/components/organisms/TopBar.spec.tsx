import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../__tests__/render.tsx';
import { TopBar } from './TopBar.tsx';

describe('TopBar', () => {
	afterEach(cleanup);

	test('renders the brand, search and filters', () => {
		renderWithProviders(<TopBar />);

		expect(screen.getByText('Pokédex')).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('Buscar por nombre o número…'),
		).toBeInTheDocument();
		expect(screen.getByText('Kanto')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Ver favoritos' }),
		).toBeInTheDocument();
	});
});
