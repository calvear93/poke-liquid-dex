import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { FavoriteHeart } from './FavoriteHeart.tsx';

describe('FavoriteHeart', () => {
	afterEach(cleanup);

	test('shows the active state and toggles on click', async () => {
		const onToggle = vi.fn();
		const ui = userEvent.setup();

		render(<FavoriteHeart active onToggle={onToggle} />);

		const button = screen.getByRole('button', {
			name: 'Quitar de favoritos',
		});
		await ui.click(button);

		expect(onToggle).toHaveBeenCalledTimes(1);
	});

	test('shows the inactive label when not favorited', () => {
		render(<FavoriteHeart active={false} onToggle={vi.fn()} />);

		expect(
			screen.getByRole('button', { name: 'Añadir a favoritos' }),
		).toBeInTheDocument();
	});
});
