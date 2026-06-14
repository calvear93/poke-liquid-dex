import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';

describe('___TestName___', () => {
	// hooks
	beforeAll(() => {
		render(<h1>Hello World</h1>);
	});

	afterEach(cleanup); // remove if you want to render once in hook

	// tests
	test('1 to be 1', () => {
		expect(1).toBe(1);
	});
});
