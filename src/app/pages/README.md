# Pages

This directory contains all the page components for the application. Pages are the main route components that get rendered when users navigate to different URLs. Each page represents a distinct view or functionality within the application.

## Overview

Pages in this application follow a structured approach where each page:

- Is a React component that serves as a route endpoint
- Has its own directory with related files (styles, tests, components, atoms)
- Follows naming conventions for consistency and maintainability
- Integrates with the routing system defined in `app/app.routes.tsx`

## Current Pages

### MainPage (`/`)

The application's homepage that displays:

- Application logos and branding
- Navigation links to other pages
- Sample atom integration demonstration
- Basic application information

**Features:**

- Uses Jotai atoms for state management
- Demonstrates asset imports (SVG, PNG)
- Shows navigation patterns with `Link` component

### ErrorPage

A specialized error boundary page for handling routing errors:

- React Router error handling
- Different error type display
- Fallback UI for application errors

**Features:**

- Error type detection (`isRouteErrorResponse`)
- User-friendly error messages
- Consistent error handling pattern

## Creating New Pages

### 1. Page Directory Structure

```
pages/
└── my-new-page/
    ├── MyNewPage.page.tsx         # Main page component
    ├── MyNewPage.page.module.css  # Page styles
    ├── MyNewPage.page.spec.tsx    # Page tests
    ├── components/                # Page-specific components
    ├── atoms/                     # Page-specific atoms
    └── __mocks__/                 # Page-specific mocks
```

### 2. Basic Page Component Template

```tsx
// pages/my-new-page/MyNewPage.page.tsx
import { useEffect } from 'react';
import { Link } from '#libs/router';
import styles from './MyNewPage.page.module.css';

export const MyNewPage: React.FC = (): React.ReactElement => {
	// hooks and init logic

	return (
		<section className={styles.page}>
			<title>My New Page</title>

			<nav>
				<Link to='/'>Back to Home</Link>
			</nav>

			<main>
				<h1>My New Page</h1>
				<p>Page content goes here...</p>
			</main>
		</section>
	);
};

export default MyNewPage;
```

## Page Organization Patterns

### Simple Pages

For basic pages with minimal complexity:

```
simple-page/
├── SimplePage.page.tsx
└── SimplePage.page.module.css
```

### Complex Pages

For pages with multiple components and logic:

```
complex-page/
├── ComplexPage.page.tsx
├── ComplexPage.page.module.css
├── ComplexPage.page.spec.tsx
├── components/
│   ├── PageHeader.tsx
│   ├── PageContent.tsx
│   └── PageSidebar.tsx
├── atoms/
│   └── page-state.atom.ts
└── hooks/
    └── use-page-logic.ts
```

### Feature-Rich Pages

For pages with extensive functionality:

```
feature-page/
├── FeaturePage.page.tsx
├── FeaturePage.page.module.css
├── FeaturePage.page.spec.tsx
├── components/
│   ├── feature-a/
│   ├── feature-b/
│   └── shared/
├── atoms/
├── hooks/
├── utils/
└── __mocks__/
```

## Routing Integration

### Route Definition

```tsx
// app/app.routes.tsx
import { lazy } from 'react';
import { MyNewPage } from './pages/my-new-page/MyNewPage.page.tsx';

export const routes = [
	{
		Layout: AppLayout,
		children: [
			{
				path: '/',
				Component: lazy(() => import('./pages/main/Main.page.tsx')),
			},
			{
				path: '/detail/:id?',
				lazy: () => import('./pages/detail/Detail.page.tsx'),
				loader: detailLoader, // Optional data loader
			},
			{
				path: '/my-new-page',
				Component: MyNewPage, // Eager
			},
		],
	},
];
```

## Testing Pages

### Real-World Page Testing Example

Based on `Detail.page.spec.tsx`, here's how pages are actually tested in this project:

```tsx
// pages/detail/Detail.page.spec.tsx
import { act, fireEvent, render, screen } from '@testing-library/react';
import { FeatureHandler, FeatureProvider } from '#libs/feature';
import { createRouter } from '#libs/router';
import { afterAll, beforeAll, describe, test, vi } from 'vitest';
import { DetailPage } from './Detail.page.tsx';

describe(DetailPage, () => {
	// Setup phase
	beforeAll(() => {
		// Mock timers for async operations
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

		// Create memory router for testing
		const DetailPageRouter = createRouter({
			routes: [{ Component: DetailPage }],
			type: 'memory',
		});

		// Configure feature flags for testing
		const features = new FeatureHandler({
			FEATURE_FETCHBOX_V2ALPHA: true,
		});

		// Render with all necessary providers
		render(
			<FeatureProvider handler={features}>
				<DetailPageRouter />
			</FeatureProvider>,
		);
	});

	// Cleanup phase
	afterAll(() => {
		vi.useRealTimers();
	});

	// Test interactive functionality
	test('fetch data clicking button', async () => {
		const button = screen.getByRole('button', { name: 'Fetch' });

		fireEvent.click(button);

		// Advance timers for async operations
		await act(async () => {
			await vi.advanceTimersToNextTimerAsync();
		});

		// Verify expected outcome
		screen.getByRole('heading', { name: 'anyValue' });
	});
});
```

### Testing Pattern Breakdown

This testing approach demonstrates several key patterns:

#### 1. Complete Environment Setup

```tsx
// Memory router for isolated testing
const DetailPageRouter = createRouter({
	routes: [{ Component: DetailPage }],
	type: 'memory', // Isolated from browser routing
});

// Feature flag configuration
const features = new FeatureHandler({
	FEATURE_FETCHBOX_V2ALPHA: true,
});
```

#### 2. Provider Composition

```tsx
// Multiple providers wrapped together
render(
	<FeatureProvider handler={features}>
		<DetailPageRouter />
	</FeatureProvider>,
);
```

#### 3. Timer Management

```tsx
beforeAll(() => {
	// Mock specific timer functions
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});

afterAll(() => {
	// Always cleanup timers
	vi.useRealTimers();
});
```

#### 4. Async Interaction Testing

```tsx
test('fetch data clicking button', async () => {
	// Find interactive element
	const button = screen.getByRole('button', { name: 'Fetch' });

	// Trigger interaction
	fireEvent.click(button);

	// Handle async operations
	await act(async () => {
		await vi.advanceTimersToNextTimerAsync();
	});

	// Verify result using accessible queries
	screen.getByRole('heading', { name: 'anyValue' });
});
```

### Testing Pages with Router Parameters

```tsx
// Testing page with URL parameters
describe('DetailPage with params', () => {
	test('handles route parameters', () => {
		const DetailPageRouter = createRouter({
			routes: [
				{
					path: '/detail/:id',
					Component: DetailPage,
				},
			],
			type: 'memory',
			options: {
				initialEntries: ['/detail/123'],
			},
		});

		render(
			<FeatureProvider handler={features}>
				<DetailPageRouter />
			</FeatureProvider>,
		);

		// Test parameter handling
		expect(screen.getByText('ID: 123')).toBeInTheDocument();
	});
});
```

### Testing Feature Flag Integration

```tsx
// Testing different feature flag configurations
describe('DetailPage feature variations', () => {
	test('renders v1 component when feature disabled', () => {
		const features = new FeatureHandler({
			FEATURE_FETCHBOX_V2ALPHA: false,
		});

		const DetailPageRouter = createRouter({
			routes: [{ Component: DetailPage }],
			type: 'memory',
		});

		render(
			<FeatureProvider handler={features}>
				<DetailPageRouter />
			</FeatureProvider>,
		);

		// Verify v1 component is rendered
		expect(screen.getByTestId('fetchbox-v1')).toBeInTheDocument();
	});

	test('renders v2 component when feature enabled', () => {
		const features = new FeatureHandler({
			FEATURE_FETCHBOX_V2ALPHA: true,
		});

		// ... similar setup

		// Verify v2 component is rendered
		expect(screen.getByTestId('fetchbox-v2')).toBeInTheDocument();
	});
});
```

### Testing Page Components with Mocks

```tsx
// Testing with mocked dependencies
describe('DetailPage with mocks', () => {
	beforeAll(() => {
		// Mock page-specific modules
		vi.mock('./atoms/async.atom.ts', () => ({
			asyncAtom: vi.fn(),
		}));

		// Mock external API calls
		vi.mock('../../../libs/api/index.ts', () => ({
			fetchData: vi.fn().mockResolvedValue({ data: 'mocked' }),
		}));
	});

	test('handles API errors gracefully', async () => {
		// Configure mock to throw error
		vi.mocked(fetchData).mockRejectedValue(new Error('API Error'));

		const button = screen.getByRole('button', { name: 'Fetch' });
		fireEvent.click(button);

		await act(async () => {
			await vi.advanceTimersToNextTimerAsync();
		});

		// Verify error handling
		expect(screen.getByText('Error loading data')).toBeInTheDocument();
	});
});
```

### Best Practices from Real Implementation

#### Setup and Teardown

- Use `beforeAll` for expensive setup (router, providers)
- Use `afterAll` for cleanup (timers, mocks)
- Keep test isolation with proper cleanup

#### Realistic Testing Environment

- Use memory router instead of browser router
- Configure feature flags as needed for test scenarios
- Wrap components with all necessary providers

#### Async Operations

- Use fake timers for predictable async testing
- Always use `act()` for state updates
- Use `vi.advanceTimersToNextTimerAsync()` for timer-based operations

#### Accessible Queries

- Prefer `screen.getByRole()` over other queries
- Use semantic queries that match user behavior
- Include accessible names in assertions

#### Feature Flag Testing

- Test both enabled and disabled feature states
- Verify correct component variants are rendered
- Test feature flag transitions if applicable

## Best Practices

### Page Component Structure

- **Export default**: Always export page components as default for lazy loading
- **Named export**: Also provide named export for testing and direct imports
- **Title element**: Include `<title>` for SEO and accessibility
- **Semantic HTML**: Use `<section>`, `<main>`, `<nav>` appropriately

### State Management

- **Page-specific atoms**: Keep atoms close to where they're used
- **Global state**: Use atoms from `app/atoms/` for shared state
- **Local state**: Use `useState` for simple, local component state
- **Effect cleanup**: Always clean up effects and subscriptions

### Performance

- **Lazy loading**: All pages should be lazy-loaded for code splitting
- **Data fetching**: Use loaders for critical data, lazy load for secondary data
- **Component optimization**: Use `React.memo` for expensive child components
- **Asset optimization**: Optimize images and other assets

### Accessibility

- **Page titles**: Set meaningful page titles
- **Focus management**: Handle focus for navigation and dynamic content
- **ARIA labels**: Use appropriate ARIA attributes
- **Keyboard navigation**: Ensure all functionality is keyboard accessible

### Error Handling

- **Error boundaries**: Implement error boundaries for robust error handling
- **Loading states**: Show appropriate loading indicators
- **Empty states**: Handle cases where data is empty or unavailable
- **Network errors**: Gracefully handle network failures

## Styling Guidelines

### CSS Modules

```css
/* Page.module.css */
.page {
	min-height: 100vh;
	padding: 2rem;
}

.content {
	max-width: 1200px;
	margin: 0 auto;
}

.header {
	margin-bottom: 2rem;
}

@media (max-width: 768px) {
	.page {
		padding: 1rem;
	}
}
```

### Responsive Design

- **Mobile-first**: Design for mobile, enhance for desktop
- **Breakpoints**: Use consistent breakpoints across pages
- **Flexible layouts**: Use CSS Grid and Flexbox for layouts
- **Touch targets**: Ensure touch targets are at least 44px

## Integration Patterns

### With Feature Flags

```tsx
import { useFeature } from '#libs/feature';

export const FeaturePage: React.FC = () => {
	const isNewFeatureEnabled = useFeature('NEW_FEATURE_V2');

	return (
		<section>
			{isNewFeatureEnabled ? (
				<NewFeatureComponent />
			) : (
				<LegacyFeatureComponent />
			)}
		</section>
	);
};
```

### With Authentication

```tsx
import { useAtomValue } from 'jotai';
import { userAtom } from '../../atoms/user.atom.ts';

export const ProtectedPage: React.FC = () => {
	const user = useAtomValue(userAtom);

	if (!user) {
		return <LoginPrompt />;
	}

	return (
		<section>
			<h1>Welcome, {user.name}!</h1>
			{/* Protected content */}
		</section>
	);
};
```

### With Layouts

```tsx
// Different layout for specific pages
export const AdminPage: React.FC = () => {
	return (
		// Content will be wrapped by AdminLayout in routes
		<section>
			<h1>Admin Dashboard</h1>
			{/* Admin content */}
		</section>
	);
};
```

## Migration and Maintenance

### Adding New Routes

1. Create the page component and directory structure
2. Add the route to `app/app.routes.tsx`
3. Create tests for the new page
4. Update navigation components if needed

### Refactoring Existing Pages

1. Ensure backward compatibility for routes
2. Update tests to match new functionality
3. Consider data migration for state changes
4. Update related components and atoms

### Performance Monitoring

- Monitor page load times
- Track Core Web Vitals
- Monitor error rates
- Analyze user interaction patterns

This README provides comprehensive guidance for working with pages in your React application, covering everything from basic concepts to advanced patterns and best practices.
