import { describe, expect, test } from 'vitest';
import type { RouteDefinition } from '../types/route.d.ts';
import { createRoutes } from './create-routes.tsx';

describe(createRoutes, () => {
	const Page: React.FC = () => <div>page</div>;
	const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
		<div>{children}</div>
	);

	// tests
	test('does not mutate the input route definitions', () => {
		const routes: RouteDefinition[] = [
			{
				children: [{ Component: Page, path: 'detail' }],
				Layout,
			},
		];

		createRoutes(routes);

		// the caller's objects keep their original shape
		expect((routes[0] as { Layout?: unknown }).Layout).toBe(Layout);
		expect(
			(routes[0] as { Component?: unknown }).Component,
		).toBeUndefined();
		expect(routes[0].children?.[0].path).toBe('detail');
	});

	test('wraps a Layout route into a Component and clears Layout', () => {
		const routes: RouteDefinition[] = [{ children: [], Layout }];

		const [result] = createRoutes(routes);

		expect(typeof result.Component).toBe('function');
		expect((result as { Layout?: unknown }).Layout).toBeUndefined();
		expect(result.path).toBe('');
	});

	test('converts a lazy import into a lazy Component', () => {
		const routes: RouteDefinition[] = [
			{ path: '/', lazy: () => Promise.resolve({ default: Page }) },
		];

		const [result] = createRoutes(routes);

		expect(result.Component).toBeDefined();
		expect((result as { lazy?: unknown }).lazy).toBeUndefined();
	});
});
