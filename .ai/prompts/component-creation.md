# React Component Creation Prompt

Create a new React component for [COMPONENT_DESCRIPTION] following these requirements:

Follow `AGENTS.md` and `.github/instructions/{coding-standards,patterns}.instructions.md` for formatting, naming, and recipes. The points below are component-specific.

## Core Requirements

### 1. Component Structure

- Type as `React.FC<Props>` (or `({ ... }: Props) =>`); keep components declarative and move business logic into custom hooks.
- Follow atomic design (`atoms`, `components`, `layouts`, `pages`); files `kebab-case`, components `PascalCase`.

### 2. TypeScript & validation

- Define a props interface with JSDoc; use Zod schemas for complex props or form data.
- Use inline type imports: `import { type FC, useState } from 'react'`. Prefer generics/`unknown` over `any`.

### 3. Styling & design

- CSS Modules for component-specific styles; UnoCSS utilities for spacing, colors, and layout.
- Responsive by default.

### 4. Accessibility & UX

- Semantic HTML and ARIA (labels, roles); keyboard navigation and focus management for interactive elements.
- Self-closing tags (`<Spinner />`), boolean props shorthand (`disabled` not `disabled={true}`), string props without braces (`title="x"`). Never use `dangerouslySetInnerHTML`.

### 5. State management

- React hooks for local state; get services/config via `useInjection(...)` from the relative `app.ioc.ts` (never hardcode config).
- Handle loading, error, and success states; clean up effects.

### 6. Error handling

- Validate inputs and surface user-friendly messages; handle edge cases. If logging, use `console.error`/`console.warn` (no `console.log`).

### 7. Testing & documentation

- Unit tests with React Testing Library; mock dependencies through `InversionOfControlProvider` + a `mockIoCValues` Map.
- Query via `screen.getBy*`/`findBy*` (never `container.querySelector`); drive interactions with `userEvent`.
- JSDoc on the component and props.

## Implementation Patterns

### Basic Component Template

```tsx
import { type FC } from 'react';

interface ComponentNameProps {
	/** Description of the prop with expected format */
	propName: string;
	/** Optional callback for user interactions */
	onAction?: (data: ActionData) => void;
	/** Loading state for async operations */
	isLoading?: boolean;
	/** Additional CSS classes for styling */
	className?: string;
}

/**
 * [Component description explaining purpose and functionality]
 *
 * @param props - Component props
 * @returns JSX element with [functionality description]
 */
export const ComponentName: FC<ComponentNameProps> = ({
	propName,
	onAction,
	isLoading = false,
	className,
}) => {
	// component implementation
};
```

### Component with IoC Integration

```tsx
import { type FC } from 'react';
import { useInjection } from '../app.ioc.ts';
import { HttpClient } from '../services/http-client.service.ts';

export const DataComponent: FC<DataComponentProps> = ({ userId }) => {
	const httpClient = useInjection(HttpClient);

	// use injected dependencies
};
```

### IoC Component Testing Pattern

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InversionOfControlProvider } from '../app.ioc.ts';
import { HttpClient } from '../services/http-client.service.ts';
import { DataComponent } from './data-component.tsx';

describe('DataComponent', () => {
	it('should work with injected dependencies', async () => {
		const mockHttpClient = {
			get: vi.fn().mockResolvedValue({ data: 'test' }),
		};

		// mock ioc container dependencies (key by the injection token)
		const mockIoCValues = new Map();
		mockIoCValues.set(HttpClient, mockHttpClient);

		render(
			<InversionOfControlProvider values={mockIoCValues}>
				<DataComponent userId='123' />
			</InversionOfControlProvider>,
		);

		expect(await screen.findByText('test')).toBeInTheDocument();
	});
});
```

### Form Component with Validation

```tsx
import { type FC } from 'react';
import { z } from 'zod';

const FormSchema = z.object({
	name: z.string().min(1, 'name is required'),
	email: z.email('invalid email format'),
});

type FormData = z.infer<typeof FormSchema>;

export const FormComponent: FC<FormProps> = ({ onSubmit }) => {
	// form implementation with zod validation
};
```

## Technical Checklist

- [ ] Props interface typed with JSDoc; `React.FC`/destructured signature
- [ ] CSS Modules + UnoCSS, responsive; accessible (ARIA, semantic HTML, keyboard)
- [ ] Loading/error/success states handled; no `dangerouslySetInnerHTML`
- [ ] Services/config via `useInjection` (no hardcoded values); logic extracted to hooks
- [ ] Zod for complex data; memoization only where it measurably helps
- [ ] Tests with `screen` queries + `userEvent`; IoC mocked via `InversionOfControlProvider`
- [ ] Covers props variations, interactions, loading/error states, and an edge case

Generate the component following these patterns and ensure it integrates seamlessly with the existing architecture.
