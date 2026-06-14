import { createRouter } from '#libs/router';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, test, vi } from 'vitest';
import { ErrorPage } from './Error.page.tsx';

describe(ErrorPage, () => {
	// hooks
	beforeAll(() => {
		// avoid React Router's noisy uncaught error logging in tests
		vi.spyOn(console, 'error').mockImplementation(() => null);
	});

	afterEach(() => {
		cleanup();
	});

	// tests
	test('renders route error status and statusText', async () => {
		const Router = createRouter({
			type: 'memory',
			routes: [
				{
					ErrorBoundary: ErrorPage,
					loader: () => {
						throw new Response('Not Found', {
							status: 404,
							statusText: 'Not Found',
						});
					},
				},
			],
		});

		render(<Router />);

		await screen.findByRole('heading', { name: '404 - Not Found' });
	});

	test('renders unknown error when thrown error is not a route response', async () => {
		const Router = createRouter({
			type: 'memory',
			routes: [
				{
					ErrorBoundary: ErrorPage,
					loader: () => {
						throw new Error('boom');
					},
				},
			],
		});

		render(<Router />);

		await screen.findByRole('heading', { name: 'Unknown Error' });
	});
});
