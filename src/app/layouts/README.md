# Layouts

Application layouts define the common structure and wrapper components used across different pages. Layouts are integrated with the routing system and defined in `app/app.routes.tsx`.

## Overview

Layouts provide a consistent structure for your application by wrapping page components with common elements like headers, footers, navigation, and sidebars. They help maintain visual consistency and reduce code duplication across pages.

## Current Layouts

### AppLayout

The main application layout that provides:

- **Header**: Application title and navigation
- **Main Content Area**: Where page content is rendered
- **Footer**: Application footer information

## Usage

### In Route Definition

```tsx
// app/app.routes.tsx
import { AppLayout } from './layouts/app/App.layout.tsx';

export const routes: RouteDefinition[] = [
	{
		Layout: AppLayout, // Layout wrapper
		children: [
			{
				path: '/',
				Component: HomePage,
			},
			{
				path: '/about',
				Component: AboutPage,
			},
		],
	},
];
```

## Creating New Layouts

### 1. Create Layout Directory

```
layouts/
└── my-new-layout/
    ├── MyNewLayout.tsx
    ├── MyNewLayout.module.css
    └── components/      # Layout-specific components
```

### 2. Layout Component Template

```tsx
import styles from './MyNewLayout.module.css';

interface MyNewLayoutProps extends React.PropsWithChildren {
	// Add layout-specific props
	title?: string;
}

export const MyNewLayout: React.FC<MyNewLayoutProps> = ({
	children,
	title,
}) => (
	<div className={styles.container}>
		<nav>Navigation</nav>
		<main>
			{title && <h1>{title}</h1>}
			{children}
		</main>
		<aside>Sidebar</aside>
	</div>
);
```

### 3. Register in Routes

```tsx
// app/app.routes.tsx
import { MyNewLayout } from './layouts/my-new-layout/MyNewLayout.tsx';

export const routes: RouteDefinition[] = [
	{
		Layout: MyNewLayout,
		children: [
			// Your routes here
		],
	},
];
```

## Layout Types & Use Cases

### Application Layout (Current)

- **Use Case**: Main application pages
- **Components**: Header, Footer, Main content area
- **Best For**: Standard pages, dashboards, content pages

### Authentication Layout

```tsx
// Example for auth pages
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => (
	<div className={styles.authContainer}>
		<div className={styles.authCard}>
			<Logo />
			{children}
		</div>
	</div>
);
```

### Admin Layout

```tsx
// Example for admin pages
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => (
	<div className={styles.adminWrapper}>
		<Sidebar />
		<div className={styles.adminContent}>
			<AdminHeader />
			<main>{children}</main>
		</div>
	</div>
);
```

## Best Practices

### Layout Design

- Keep layouts focused on structure, not content
- Use CSS Modules for layout-specific styling
- Make layouts responsive by default
- Consider accessibility (semantic HTML, ARIA labels)

### Component Organization

- Break down complex layouts into smaller components
- Keep layout-specific components within the layout directory
- Use TypeScript interfaces for props validation

### Performance

- Lazy load layout components if they're large
- Minimize re-renders by using React.memo when appropriate
- Optimize CSS by avoiding unnecessary re-calculations

### Responsive Design

```css
/* App.layout.module.css */
.layout {
	display: grid;
	grid-template-rows: auto 1fr auto;
	min-height: 100vh;
}

@media (max-width: 768px) {
	.layout {
		grid-template-rows: auto 1fr auto;
	}
}
```

## Common Layout Patterns

### Nested Layouts

```tsx
// Main app layout with nested admin layout
const routes = [
	{
		Layout: AppLayout,
		children: [
			{
				path: '/admin',
				Layout: AdminLayout, // Nested layout
				children: [
					{ path: 'users', Component: UsersPage },
					{ path: 'settings', Component: SettingsPage },
				],
			},
		],
	},
];
```

### Conditional Layouts

```tsx
// Different layouts based on user role
const getLayoutForRole = (role: string) => {
	switch (role) {
		case 'admin':
			return AdminLayout;
		case 'user':
			return UserLayout;
		default:
			return AppLayout;
	}
};
```

## Troubleshooting

### Common Issues

1. **Layout not rendering**: Check that Layout is properly imported in routes
2. **Styles not applying**: Verify CSS Module import and class names
3. **Children not showing**: Ensure `{children}` is rendered in layout component
4. **Nested layouts not working**: Verify parent layout includes `<Outlet />` or `{children}`
