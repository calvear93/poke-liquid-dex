import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { FormPills } from './FormPills.tsx';

describe('FormPills', () => {
	afterEach(cleanup);

	test('selects a form on click', async () => {
		const onSelect = vi.fn();
		const ui = userEvent.setup();

		render(
			<FormPills
				activeUrl='p/1'
				items={[
					{ label: 'Predeterminada', url: 'p/1' },
					{ label: 'mega', url: 'p/2' },
				]}
				onSelect={onSelect}
			/>,
		);

		await ui.click(screen.getByRole('button', { name: 'mega' }));

		expect(onSelect).toHaveBeenCalledWith('p/2');
	});
});
