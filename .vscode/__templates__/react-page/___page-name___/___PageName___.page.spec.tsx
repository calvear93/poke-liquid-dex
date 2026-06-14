import { MemoryRouter } from '#libs/router';
import { beforeAll, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ___PageName___Page } from './___PageName___.page.tsx';

describe(___PageName___Page, () => {
	// hooks
	beforeAll(() => {
		render(
			<MemoryRouter>
				<___PageName___Page />
			</MemoryRouter>,
		);
	});

	// tests
	test('has heading level 1 page name', () => {
		const heading = screen.getByRole('heading');

		expect(heading.textContent).toBe('___PageName___Page');
	});
});
