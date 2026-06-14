import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ___ComponentName___ } from './___ComponentName___.tsx';

describe(___ComponentName___, () => {
	// hooks
	beforeAll(() => {
		render(<___ComponentName___ />);
	});

	afterEach(cleanup);

	// tests
	test('has heading level 1 component name', () => {
		const heading = screen.getByRole('heading');

		expect(heading.textContent).toBe('___ComponentName___');
	});
});
