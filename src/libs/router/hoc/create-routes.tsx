import { lazy, Suspense } from 'react';
import { Outlet, type RouteObject } from 'react-router';
import { isLayoutRoute } from '../types/is-layout-route.ts';
import type {
	ComponentRoute,
	LayoutRouteComponent,
	RouteDefinition,
} from '../types/route.d.ts';

const renderLayout = (
	Layout: LayoutRouteComponent,
	loading: React.ReactNode,
) => {
	if (loading)
		return () => (
			<Layout>
				<Suspense fallback={loading}>
					<Outlet />
				</Suspense>
			</Layout>
		);

	return () => (
		<Layout>
			<Outlet />
		</Layout>
	);
};

export const createRoutes = (routes: RouteDefinition[]): RouteObject[] => {
	return routes.map((route): RouteObject => {
		// clone so the caller's route definitions are never mutated
		const next = { ...route } as ComponentRoute;

		if (isLayoutRoute(route)) {
			next.Component = renderLayout(route.Layout, route.loading);

			(next as RouteDefinition).Layout = undefined;
		}

		next.path ??= '';

		// lazy load component for chunk splitting
		if (next.lazy) {
			next.Component ??= lazy(next.lazy);
			next.lazy = undefined;
		}

		if (next.children) {
			(next as RouteObject).children = createRoutes(next.children);
		}

		return next as RouteObject;
	});
};
