import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { IconButton } from './IconButton.tsx';
import { PokeballLoader } from './PokeballLoader.tsx';

describe('IconButton', () => {
	afterEach(cleanup);

	test('labels the button and fires onClick', async () => {
		const onClick = vi.fn();
		const ui = userEvent.setup();

		render(
			<IconButton label='Cambiar tema' onClick={onClick}>
				◐
			</IconButton>,
		);

		await ui.click(screen.getByRole('button', { name: 'Cambiar tema' }));

		expect(onClick).toHaveBeenCalledTimes(1);
	});
});

describe('PokeballLoader', () => {
	afterEach(cleanup);

	test('renders a status with its label', () => {
		render(<PokeballLoader label='Cargando ficha…' />);

		expect(screen.getByRole('status')).toHaveTextContent('Cargando ficha…');
	});
});
