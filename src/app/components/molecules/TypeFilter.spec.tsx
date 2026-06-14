import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../__tests__/render.tsx';
import { TypeFilter } from './TypeFilter.tsx';

describe('TypeFilter', () => {
	afterEach(cleanup);

	test('renders the "Todos" chip and the Spanish type labels', () => {
		renderWithProviders(<TypeFilter />);

		expect(
			screen.getByRole('button', { name: 'Todos' }),
		).toBeInTheDocument();
		expect(screen.getByText('Fuego')).toBeInTheDocument();
		expect(screen.getByText('Agua')).toBeInTheDocument();
	});
});
