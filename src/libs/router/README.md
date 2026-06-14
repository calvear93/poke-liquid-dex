# 🛣️ `#libs/router` — Declarative Routing

> A thin, type-safe layer over [React Router v7](https://reactrouter.com/) that turns a plain config object into a ready-to-render `<Router />` — with first-class **layouts**, **code-splitting**, and **multiple router types**.

You write a tree of routes; the library wires up `RouterProvider`, `Suspense`, layout `Outlet`s, and lazy chunks for you. Everything from `react-router` is re-exported, so this is your single routing import.

## ✨ Highlights

- **Config → component** — `createRouter(config)` returns a plain `React.FC`.
- **Layouts as first-class nodes** — a `Layout` wraps its `children` via `<Outlet />`, nestable to any depth.
- **Two ways to lazy-load** — pass `Component: lazy(() => import(...))`, or just `lazy: () => import(...)` and let the library wrap it.
- **Three router types** — `browser` (default), `hash`, `memory`.
- **One import surface** — re-exports `Link`, `useNavigate`, `useParams`, `useLocation`, `Outlet`, `Navigate`, … from `react-router`.

## 📦 API at a glance

| Export                   | Signature              | Description                                     |
| ------------------------ | ---------------------- | ----------------------------------------------- |
| `createRouter`           | `(config) => React.FC` | builds a render-ready router component          |
| `useHashValue`           | `() => string`         | current URL hash, without the leading `#`       |
| `RouteDefinition`        | type                   | a component route **or** a layout route (XOR)   |
| _…all of_ `react-router` | re-exported            | `Link`, `useNavigate`, `useParams`, `Outlet`, … |

**`createRouter(config)`**

| Field     | Type                              | Default     | Notes                                          |
| --------- | --------------------------------- | ----------- | ---------------------------------------------- |
| `routes`  | `RouteDefinition[]`               | —           | the route tree                                 |
| `loading` | `React.ReactNode`                 | `undefined` | top-level `<Suspense>` fallback                |
| `type`    | `'browser' \| 'hash' \| 'memory'` | `'browser'` | which React Router factory to use              |
| `options` | router options                    | `undefined` | `{ basename }`; `memory` adds `initialEntries` |

## 🚀 Quick start

```tsx
// app/app.routes.tsx
import { lazy } from 'react';
import type { RouteDefinition } from '#libs/router';
import { AppLayout } from './layouts/app/App.layout.tsx';

export const routes: RouteDefinition[] = [
	{
		Layout: AppLayout, // wraps all children with <Outlet />; path defaults to '/'
		children: [
			{ path: '/', lazy: () => import('./pages/main/Main.page.tsx') },
			{
				path: '/detail/:id?',
				lazy: () => import('./pages/detail/Detail.page.tsx'),
			},
		],
	},
];
```

```tsx
// app/App.tsx
import { createRouter } from '#libs/router';
import { routes } from './app.routes.tsx';

const Router = createRouter({ routes, loading: <h1>Loading…</h1> });

export const App = () => <Router />;
```

## 🧱 Routes: components & layouts

A `RouteDefinition` is **either** a component route **or** a layout route:

```tsx
// Component route — renders a component at a path
{ path: '/about', Component: AboutPage }
{ path: '/posts/:id', lazy: () => import('./Post.page.tsx') } // auto-wrapped in React.lazy

// Layout route — wraps its children (no Component of its own)
{
	Layout: DashboardLayout, // receives children via <Outlet />
	loading: <Spinner />,    // optional Suspense fallback for this branch
	children: [
		{ path: '/dashboard', Component: Overview },
		{ path: '/dashboard/settings', Component: Settings },
	],
}
```

Layouts nest freely — put a `Layout` route inside another layout's `children` to compose shells (app → dashboard → section).

A layout is just a component that renders its children slot:

```tsx
// app/layouts/app/App.layout.tsx
import { Outlet } from '#libs/router';

export const AppLayout = ({ children }: React.PropsWithChildren) => (
	<div className='app'>
		<Header />
		<main>{children}</main>
		<Footer />
	</div>
);
```

## 🔀 Router types

```tsx
createRouter({ routes }); // browser (HTML5 history) — the default
createRouter({ routes, type: 'hash' }); // hash routing for static hosting
createRouter({
	routes,
	type: 'memory',
	options: { initialEntries: ['/'] }, // in-memory — ideal for tests & embeds
});
```

## 🍳 Recipes

### Public vs. private routers

```tsx
const PublicRouter = createRouter({ routes: publicRoutes });
const PrivateRouter = createRouter({ routes: privateRoutes });

export const App = () => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <PrivateRouter /> : <PublicRouter />;
};
```

### Auth guard as a layout

```tsx
import { Navigate, Outlet } from '#libs/router';

const ProtectedLayout = () => {
	const { isAuthenticated } = useAuth();
	return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />;
};

export const routes: RouteDefinition[] = [
	{
		Layout: ProtectedLayout,
		children: [{ path: '/profile', Component: Profile }],
	},
];
```

### Read params & navigate (straight from `react-router`)

```tsx
import { Link, useNavigate, useParams } from '#libs/router';

export const DetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	return (
		<>
			<h1>Item {id}</h1>
			<Link to='/'>Home</Link>
			<button onClick={() => navigate(-1)}>Back</button>
		</>
	);
};
```

### The current hash

```tsx
import { useHashValue } from '#libs/router';

const ActiveTab = () => <span>{useHashValue() || 'overview'}</span>;
```

## 🧪 Testing

Render against an in-memory router — no DOM history needed:

```tsx
import { render, screen } from '@testing-library/react';
import { createRouter } from '#libs/router';

it('shows the home page', () => {
	const Router = createRouter({
		routes,
		type: 'memory',
		options: { initialEntries: ['/'] },
	});

	render(<Router />);
	expect(screen.getByText('Welcome')).toBeInTheDocument();
});
```

## 🧠 How it works

`createRouter` runs your config through `createRoutes`, which: converts each `Layout` route into a component that renders `<Layout><Outlet /></Layout>` (wrapped in `<Suspense>` when `loading` is set), turns any `lazy` import into `React.lazy`, defaults a missing `path` to `''`, and recurses into `children`. The normalized tree is handed to the matching React Router factory (`createBrowserRouter` / `createHashRouter` / `createMemoryRouter`), and the returned `React.FC` renders `<Suspense><RouterProvider /></Suspense>`.
