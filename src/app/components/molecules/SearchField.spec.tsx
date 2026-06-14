import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { SearchField } from './SearchField.tsx';

describe('SearchField', () => {
	afterEach(cleanup);

	test('renders the input and shows the clear button after typing', async () => {
		const ui = userEvent.setup();

		render(<SearchField />);

		const input = screen.getByPlaceholderText(
			'Buscar por nombre o número…',
		);
		await ui.type(input, 'pika');

		expect(input).toHaveValue('pika');
		expect(
			screen.getByRole('button', { name: 'Limpiar búsqueda' }),
		).toBeInTheDocument();
	});
});
