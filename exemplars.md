# Code Exemplars

This document identifies high-quality, representative code examples from the React TypeScript Template (Vite) codebase. These exemplars demonstrate our coding standards and patterns to help maintain consistency across development teams.

## Architecture Layer Exemplars

### Presentation Layer

#### Main Page Component (`src/app/pages/main/Main.page.tsx`)

**Pattern**: Page component with state management and routing
**Key Features**:

- Clean component structure with proper TypeScript typing
- Integration with Jotai atoms for state management
- React Router Link components for navigation
- CSS Modules for styling
- Proper effect cleanup and state updates

```tsx
export const MainPage: React.FC = (): React.ReactElement => {
	const [message, setStatus] = useAtom(sampleAtom);

	// effects
	useEffect(() => {
		setStatus(200);
	}, [setStatus]);

	// jsx
	return (
		<section className={styles.page}>
			<title>Main Page</title>
			<Link to='/detail'>Go To Detail</Link>
			<Link to='/detail/123'>Go To Detail 123</Link>
			<h1 className='text-primary font-bold underline'>hello world</h1>
			<h2>{import.meta.env.APP_ENV}</h2>
			<h3 className='text-green-700 font-bold'>{message}</h3>
		</section>
	);
};
```

#### App Initialization (`src/app/App.tsx`)

**Pattern**: Application root component
**Key Features**:

- Clean provider composition pattern
- Feature flag integration at app level
- Router integration
- Minimal, focused component structure

```tsx
export const App: React.FC = (): React.ReactElement => {
	return (
		<FeatureProvider handler={featureHandler}>
			<AppRouter />
		</FeatureProvider>
	);
};
```

### Business Logic Layer

#### Feature Flag Handler (`src/libs/feature/feature.handler.ts`)

**Pattern**: Event-driven business logic with reactive state management
**Key Features**:

- Event-driven architecture with EventTarget
- Type-safe feature flag management
- Bulk operations with change detection
- Proper encapsulation and API design

```typescript
export class FeatureHandler {
	get(feature: string): boolean {
		return !!this._features[feature];
	}

	set(feature: string, value: boolean): void {
		const willChange = this._willChange(feature, value);
		this._features[feature] = value;

		if (willChange)
			this._emitter.dispatchEvent(
				new FeatureChangedEvent({ [feature]: value }),
			);
	}

	private _willChange(feature: string, value: boolean): boolean {
		return !!this._features[feature] !== value;
	}
}
```

#### IoC Container Implementation (`src/libs/ioc/ioc.builder.tsx`)

**Pattern**: Custom dependency injection container with React integration
**Key Features**:

- React Context integration for component-level injection
- Type-safe dependency resolution
- Support for both class and token-based bindings
- Proper React patterns with useMemo for performance

```tsx
export const createContainer = () => {
	const container = new Map<unknown, unknown>();

	return {
		useInjection: <T>(key: unknown): T => {
			const context = useContext(IoCContext);
			const map = context ?? container;
			return map.get(key) as T;
		},
		container: {
			bind: (key: any, value: any) => container.set(key, value),
			resolve: <T>(key: unknown): T => container.get(key) as T,
		},
	};
};
```

### Data Access Layer

#### Jotai Atom Pattern (`src/app/atoms/sample.atom.ts`)

**Pattern**: Atomic state management with derived state
**Key Features**:

- Read/write atom pattern with derived state
- Type-safe state definitions
- Proper separation of concerns between read and write logic

```typescript
const _innerAtom = atom<SampleState>({
	message: 'loading',
	status: 0,
});

export const sampleAtom = atom(
	(get) => get(_innerAtom).message,
	(_get, set, status: number) => {
		set(_innerAtom, {
			message: status === 200 ? 'success' : 'error',
			status,
		});
	},
);
```

### Cross-Cutting Concerns

#### Feature Flag React Hook (`src/libs/feature/react/feature.hook.ts`)

**Pattern**: Custom React hook with proper lifecycle management
**Key Features**:

- Proper useEffect cleanup
- Error handling with custom exceptions
- Type-safe context usage
- Event listener management

```typescript
export const useFeature = (feature: string) => {
	const handler = useFeatureHandler();
	const [value, setFeature] = useState(handler.get(feature));

	useEffect(() => {
		const listener: FeatureOnChangeListener = ({ changedFeatures }) => {
			const newValue = changedFeatures?.[feature];
			if (newValue !== undefined) {
				setFeature(newValue);
			}
		};

		handler.addOnChangeListener(listener);
		return () => handler.removeOnChangeListener(listener);
	}, [feature]);

	return [value, (value: boolean) => handler.set(feature, value)] as const;
};
```

#### Feature Provider (`src/libs/feature/react/Feature.provider.tsx`)

**Pattern**: React Context provider pattern
**Key Features**:

- Clean provider implementation
- Proper TypeScript interfaces
- Comprehensive JSDoc documentation with examples

```tsx
export const FeatureProvider: React.FC<FeatureProviderProps> = ({
	children,
	handler,
}) => {
	return (
		<FeatureContext.Provider value={handler}>
			{children}
		</FeatureContext.Provider>
	);
};
```

## Pattern Type Exemplars

### Dependency Injection

#### IoC Container Setup (`src/app/app.ioc.ts`)

**Pattern**: Application-level dependency configuration
**Key Features**:

- Centralized dependency configuration
- Token-based dependency management
- Clear separation between configuration and usage

```typescript
export const { InversionOfControlProvider, container, useInjection } =
	createContainer();

// define dependencies
container.bind('injectionToken', { example: 'demo' });
```

### State Management

#### Jotai Atom Test (`src/app/atoms/sample.atom.spec.ts`)

**Pattern**: Comprehensive atom testing with proper setup
**Key Features**:

- Proper test setup with renderHook
- State verification across different scenarios
- Clean test structure with beforeAll hooks

```typescript
describe('sample atom', () => {
	let hook: HookCurrent;
	let rerender: () => void;

	beforeAll(() => {
		({ rerender, result: hook } = renderSampleAtom());
	});

	test('initial state returns "loading"', () => {
		const {
			current: [state],
		} = hook;
		expect(state).toBe('loading');
	});
});
```

### Routing

#### Router HOC (`src/libs/router/hoc/create-router.hoc.tsx`)

**Pattern**: Higher-order component for router creation
**Key Features**:

- Factory pattern for different router types
- Suspense integration for lazy loading
- Type-safe configuration interfaces
- Comprehensive JSDoc with usage examples

```typescript
export const createRouter = ({
	loading,
	options,
	routes: routesDef,
	type = 'browser',
}: RouterConfig): React.FC => {
	const routes = createRoutes(routesDef);
	const create = getRouterFactory[type];
	const router = create(routes, options);

	return (): React.ReactElement => (
		<Suspense fallback={loading}>
			<RouterProvider router={router} />
		</Suspense>
	);
};
```

### Component Architecture

#### Router Hook (`src/libs/router/router.hook.ts`)

**Pattern**: Custom hook for router utilities
**Key Features**:

- Focused, single-responsibility hook
- Proper React Router integration
- Clean API design with JSDoc examples

```typescript
export const useHashValue = (): string => {
	const { hash } = useLocation();
	return hash.slice(1);
};
```

### Testing

#### IoC Container Test (`src/libs/ioc/ioc.builder.spec.tsx`)

**Pattern**: Integration testing with React Testing Library
**Key Features**:

- Proper component rendering with providers
- Hook testing with renderHook
- Context isolation testing
- Clean test component patterns

```tsx
test('InversionOfControlProvider replace the inner container', () => {
	const TestComponent = ({ id }: { id: string }) => {
		const provider = useInjection(TestClass);
		return <h1 data-testid={id}>{provider?.test()}</h1>;
	};

	render(
		<>
			<TestComponent id='c1' />
			<InversionOfControlProvider values={new Map()}>
				<TestComponent id='c2' />
			</InversionOfControlProvider>
		</>,
	);
});
```

#### Feature Handler Test (`src/libs/feature/feature.handler.spec.ts`)

**Pattern**: Unit testing with mocking and event verification
**Key Features**:

- Event-driven testing with mocks
- Edge case testing (no-change scenarios)
- Static method testing
- Proper test isolation

```typescript
test('has event sourcing capabilities', () => {
	const feature = randomUUID();
	const callbackMock = vi.fn();

	_handler.addOnChangeListener(callbackMock);
	_handler.set(feature, true);
	_handler.removeOnChangeListener(callbackMock);

	expect(callbackMock).toHaveBeenCalledOnce();
});
```

#### Router Hook Test (`src/libs/router/router.hook.spec.tsx`)

**Pattern**: Router integration testing
**Key Features**:

- MemoryRouter for isolated testing
- Proper wrapper setup for router context
- Clean, focused test cases

```tsx
test('useHashValue returns current path hash', () => {
	const { result } = renderHook(useHashValue, {
		wrapper: ({ children }) => (
			<MemoryRouter initialEntries={[`/path#myHash`]}>
				{children}
			</MemoryRouter>
		),
	});

	expect(result.current).toBe('myHash');
});
```

## Consistency Patterns Observed

### Naming Conventions

- PascalCase for components and classes
- camelCase for functions and variables
- kebab-case for file names
- `_` prefix for private members

### Code Organization

- Clear separation of concerns
- Logical file structure by feature/domain
- Consistent import organization
- Proper barrel exports

### Documentation Standards

- Comprehensive JSDoc comments
- TypeScript interface definitions
- Usage examples in documentation
- Clear parameter and return type documentation

### Testing Patterns

- Consistent test structure with describe/it blocks
- Proper setup with beforeAll/beforeEach hooks
- Mock usage with vi.fn()
- Component testing with React Testing Library

## Recommendations for Maintaining Code Quality

1. **Follow Established Patterns**: Use the exemplars above as templates for new implementations
2. **Maintain Type Safety**: Always use explicit TypeScript types and interfaces
3. **Write Comprehensive Tests**: Follow the testing patterns shown in the exemplars
4. **Document APIs**: Include JSDoc comments with examples for public APIs
5. **Use Proper Error Handling**: Implement try-catch blocks and custom error types
6. **Follow React Best Practices**: Use functional components with proper hook patterns
