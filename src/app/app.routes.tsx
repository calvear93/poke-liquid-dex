import { type RouteDefinition } from '#libs/router';
import { AppLayout } from './layouts/app/App.layout.tsx';
import ErrorPage from './pages/error/Error.page.tsx';
import { PokedexPage } from './pages/pokedex/Pokedex.page.tsx';

/**
 * App routes. The Pokédex is a single page; the detail and comparison views are
 * modal overlays driven by global state (the detail id is mirrored in the URL).
 */
export const routes = {
	app: [
		{
			ErrorBoundary: ErrorPage,
			Layout: AppLayout,
			children: [
				{
					Component: PokedexPage,
				},
			],
		},
	],
} satisfies Record<string, RouteDefinition[]>;
