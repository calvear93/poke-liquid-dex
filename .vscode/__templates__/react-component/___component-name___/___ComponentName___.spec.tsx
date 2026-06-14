import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ___ComponentName___ } from './___ComponentName___.tsx';

describe(___ComponentName___, () => {
	// hooks
	beforeAll(() => {
		render(<___ComponentName___ title='sample' />);
	});

	afterEach(cleanup);

	// tests
	test('has heading level 1 with "sample" content', () => {
		const heading = screen.getByRole('heading');

		expect(heading.textContent).toBe('sample');
	});

	test('has span with component name content', () => {
		const span = screen.getByText('___ComponentName___');

		expect(span.tagName).toBe('SPAN');
	});
});
