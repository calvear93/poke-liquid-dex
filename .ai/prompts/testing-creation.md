# Testing Creation Prompt

Create comprehensive tests for [COMPONENT/HOOK_NAME] following the project's testing best practices.

Follow `AGENTS.md` → Testing and `.github/instructions/patterns.instructions.md` → Testing patterns. The points below are test-specific.

## Core Requirements

### 1. Framework & structure

- Vitest + React Testing Library + `@testing-library/user-event` (happy-dom). Place specs as `*.spec.tsx`/`*.spec.ts` next to the source.
- Group with `describe`; descriptive `it` names; reset mocks in `beforeEach`.

### 2. Queries & interactions

- Use `screen.getBy*`/`queryBy*`/`findBy*` — never destructure `container` or use `container.querySelector` (`no-container`/`no-node-access`).
- Async UI: assert with `findBy*` or `waitFor` (prefer `findBy*`). Drive interactions with `userEvent.setup()` and `await` every action.

### 3. Coverage

- Render with different props; user interactions; loading/error/success states; accessibility; edge cases.

### 4. Mocking strategy

- Mock services/config through the IoC container: wrap in `InversionOfControlProvider` with a `mockIoCValues` Map keyed by the injection token (do NOT use MSW).
- Avoid over-mocking React internals.

## Implementation Patterns

### Component Testing Template

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InversionOfControlProvider } from '../app.ioc.ts';
import { DataService } from '../services/data.service.ts';
import { ComponentName } from './component-name.tsx';

// mock dependencies
const mockOnAction = vi.fn();
const mockService = {
	getData: vi.fn(),
	updateData: vi.fn(),
};

describe('ComponentName', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render with required props', () => {
			const props = {
				title: 'Test Title',
				data: { id: '1', name: 'Test Data' },
			};

			render(<ComponentName {...props} />);

			expect(screen.getByText('Test Title')).toBeInTheDocument();
			expect(screen.getByText('Test Data')).toBeInTheDocument();
		});

		it('should render with IoC dependencies', () => {
			const props = { title: 'Test Title' };

			// mock ioc container dependencies (key by the injection token)
			const mockIoCValues = new Map();
			mockIoCValues.set(DataService, mockService);

			render(
				<InversionOfControlProvider values={mockIoCValues}>
					<ComponentName {...props} />
				</InversionOfControlProvider>,
			);

			expect(screen.getByText('Test Title')).toBeInTheDocument();
		});

		it('should render loading state correctly', () => {
			render(<ComponentName isLoading title='Test' />);

			expect(screen.getByRole('progressbar')).toBeInTheDocument();
			expect(screen.getByText(/loading/i)).toBeInTheDocument();
		});

		it('should render error state correctly', () => {
			const errorMessage = 'Something went wrong';
			render(<ComponentName title='Test' error={errorMessage} />);

			expect(screen.getByRole('alert')).toBeInTheDocument();
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});
	});

	describe('User Interactions', () => {
		it('should call onAction when button is clicked', async () => {
			const user = userEvent.setup();
			render(<ComponentName onAction={mockOnAction} title='Test' />);

			await user.click(screen.getByRole('button', { name: /action/i }));

			expect(mockOnAction).toHaveBeenCalledTimes(1);
		});

		it('should handle form submission correctly', async () => {
			const user = userEvent.setup();
			render(<ComponentName onSubmit={mockOnAction} title='Test' />);

			const input = screen.getByLabelText(/name/i);
			const submitButton = screen.getByRole('button', {
				name: /submit/i,
			});

			await user.type(input, 'Test Name');
			await user.click(submitButton);

			expect(mockOnAction).toHaveBeenCalledWith({
				name: 'Test Name',
			});
		});

		it('should handle keyboard navigation', async () => {
			const user = userEvent.setup();
			render(<ComponentName onAction={mockOnAction} title='Test' />);

			// tab to the button and activate with the keyboard
			await user.tab();
			await user.keyboard('{Enter}');

			expect(mockOnAction).toHaveBeenCalledTimes(1);
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA attributes', () => {
			render(<ComponentName title='Test' />);

			const element = screen.getByRole('region');
			expect(element).toHaveAttribute('aria-label', 'ComponentName');
		});

		it('should be keyboard accessible', () => {
			render(<ComponentName title='Test' onAction={mockOnAction} />);

			const button = screen.getByRole('button', { name: /action/i });
			expect(button).toHaveAttribute('tabIndex', '0');
		});

		it('should have proper heading hierarchy', () => {
			render(<ComponentName title='Main Title' />);

			const heading = screen.getByRole('heading', { level: 2 });
			expect(heading).toHaveTextContent('Main Title');
		});
	});

	describe('Error Handling', () => {
		it('should handle async operation errors', async () => {
			mockService.getData.mockRejectedValue(new Error('api error'));

			render(<ComponentName title='Test' />);

			expect(await screen.findByText(/api error/i)).toBeInTheDocument();
		});

		it('should retry failed operations', async () => {
			const user = userEvent.setup();
			mockService.getData
				.mockRejectedValueOnce(new Error('first failure'))
				.mockResolvedValueOnce({ data: 'success' });

			render(<ComponentName title='Test' />);

			// wait for initial error
			expect(
				await screen.findByText(/first failure/i),
			).toBeInTheDocument();

			// click retry button
			await user.click(screen.getByRole('button', { name: /retry/i }));

			// wait for success
			expect(await screen.findByText('success')).toBeInTheDocument();
			expect(mockService.getData).toHaveBeenCalledTimes(2);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty data gracefully', () => {
			render(<ComponentName data={[]} title='Test' />);

			expect(screen.getByText(/no data available/i)).toBeInTheDocument();
		});

		it('should handle invalid props gracefully', () => {
			// suppress console.error for this test
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			render(<ComponentName title='' />);

			expect(
				screen.getByText(/please provide a title/i),
			).toBeInTheDocument();

			consoleSpy.mockRestore();
		});
	});
});
```

### Hook Testing Template

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { type FC, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InversionOfControlProvider } from '../app.ioc.ts';
import { HttpClient } from '../services/http-client.service.ts';
import { useCustomHook } from './use-custom-hook.ts';

// mock dependencies, injected through the ioc container
const mockHttpClient = {
	get: vi.fn(),
	post: vi.fn(),
};

const mockIoCValues = new Map();
mockIoCValues.set(HttpClient, mockHttpClient);

const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
	<InversionOfControlProvider values={mockIoCValues}>
		{children}
	</InversionOfControlProvider>
);

describe('useCustomHook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Initial State', () => {
		it('should return initial state correctly', () => {
			const { result } = renderHook(() => useCustomHook('test-url'), {
				wrapper,
			});

			expect(result.current.data).toBeNull();
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBeNull();
		});
	});

	describe('Data Fetching', () => {
		it('should fetch data successfully', async () => {
			const mockData = { id: '1', name: 'Test Data' };
			mockHttpClient.get.mockResolvedValue(mockData);

			const { result } = renderHook(() => useCustomHook('test-url'), {
				wrapper,
			});

			await waitFor(() => {
				expect(result.current.data).toEqual(mockData);
			});
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		it('should handle fetch errors', async () => {
			mockHttpClient.get.mockRejectedValue(new Error('network error'));

			const { result } = renderHook(() => useCustomHook('test-url'), {
				wrapper,
			});

			await waitFor(() => {
				expect(result.current.error).toBe('network error');
			});
			expect(result.current.data).toBeNull();
			expect(result.current.loading).toBe(false);
		});
	});

	describe('Hook Dependencies', () => {
		it('should refetch when url changes', async () => {
			const { rerender } = renderHook(({ url }) => useCustomHook(url), {
				initialProps: { url: 'test-url-1' },
				wrapper,
			});

			await waitFor(() => {
				expect(mockHttpClient.get).toHaveBeenCalledWith('test-url-1');
			});

			rerender({ url: 'test-url-2' });

			await waitFor(() => {
				expect(mockHttpClient.get).toHaveBeenCalledWith('test-url-2');
			});
		});
	});
});
```

### Integration Testing Template

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FC, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from '#libs/router';
import { PageComponent } from './page-component.tsx';

// wrapper for components that need router context
const RouterWrapper: FC<{ children: ReactNode }> = ({ children }) => (
	<MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
);

describe('PageComponent Integration', () => {
	it('should handle complete user workflow', async () => {
		const user = userEvent.setup();

		render(<PageComponent />, { wrapper: RouterWrapper });

		await user.type(screen.getByLabelText(/name/i), 'John Doe');
		await user.type(screen.getByLabelText(/email/i), 'john@example.com');
		await user.click(screen.getByRole('button', { name: /submit/i }));

		// verify the complete workflow
		expect(await screen.findByText(/success/i)).toBeInTheDocument();
	});
});
```

## Technical Checklist

- [ ] Renders across prop variations; interactions via `userEvent` (awaited)
- [ ] Loading/error/success states covered; async asserted with `findBy*`/`waitFor`
- [ ] Accessibility checked via roles/labels (no `container.querySelector`)
- [ ] Form validation/submission and routing (for pages) covered
- [ ] Dependencies mocked through `InversionOfControlProvider` (no MSW); mocks reset in `beforeEach`
- [ ] Tests independent; assert user-visible output, not internals; meaningful (mutation-aware) assertions

Generate comprehensive tests following these patterns and ensure they cover all critical functionality and edge cases.
