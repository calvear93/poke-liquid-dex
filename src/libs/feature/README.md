# 🎛️ `#libs/feature` — Feature Flags

> Runtime feature toggles with reactive React bindings. Flip a flag and every subscribed component re-renders — no reload, no prop-drilling.

A small `FeatureHandler` holds the flag state and emits change events; React hooks and a component switch subscribe to it. Flags can also be driven live from `localStorage` / `sessionStorage`.

## ✨ Highlights

- **Reactive** — `useFeature` re-renders only the components watching a flag that actually changed.
- **Imperative or declarative** — read/set flags via the handler, or swap whole components with `withFeatures`.
- **Component switching** — ship `v1`/`v2` side by side and pick by flag, with lazy-loading built in.
- **Storage-driven** — toggle flags from devtools by setting a prefixed `localStorage`/`sessionStorage` key.
- **Tiny & framework-agnostic core** — `FeatureHandler` is plain TS over `EventTarget`; the React layer is optional.

## 📦 API at a glance

| Export                        | Type                                             | Use it to…                                     |
| ----------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| `FeatureHandler`              | class                                            | hold + mutate flag state (the source of truth) |
| `FeatureProvider`             | `React.FC<{ handler }>`                          | expose a handler to the React tree             |
| `useFeature(name)`            | `() => readonly [boolean, (v: boolean) => void]` | read **and** set one flag, with re-render      |
| `useFeatureHandler()`         | `() => FeatureHandler`                           | reach the handler without subscribing          |
| `withFeatures(config)`        | HOC → component                                  | render different components per enabled flag   |
| `linkStorageToFeatureHandler` | `(handler, prefix?) => void`                     | drive flags from web storage (live)            |

**`FeatureHandler`**

| Member                               | Description                                         |
| ------------------------------------ | --------------------------------------------------- |
| `new FeatureHandler(lookup?)`        | seed with `{ FLAG: boolean }`                       |
| `get(name) → boolean`                | is the flag on?                                     |
| `getAll() → Readonly<lookup>`        | snapshot of every flag                              |
| `set(name, value)`                   | toggle one flag (emits only if it actually changed) |
| `setAll(lookup)`                     | merge many flags (single event for the batch)       |
| `add/removeOnChangeListener(fn)`     | subscribe to `{ changedFeatures }` events           |
| `FeatureHandler.fromArray(string[])` | static · `['A','B']` → `{ A: true, B: true }`       |

## 🚀 Quick start

**1. Create a handler and provide it:**

```tsx
// app/app.features.ts
import { FeatureHandler } from '#libs/feature';

export const features = new FeatureHandler({
	NEW_CHECKOUT: true,
	BETA_DASHBOARD: import.meta.env.BETA === 'true',
	PROMO_BANNER: globalThis.FEATURES?.promo ?? false,
});
```

```tsx
// app/App.tsx
import { FeatureProvider } from '#libs/feature';
import { features } from './app.features.ts';

export const App = () => (
	<FeatureProvider handler={features}>
		<Routes />
	</FeatureProvider>
);
```

**2. Read & toggle a flag — the component re-renders on change:**

```tsx
import { useFeature } from '#libs/feature';

export const Dashboard = () => {
	const [betaOn, setBeta] = useFeature('BETA_DASHBOARD');

	return betaOn ? (
		<BetaDashboard onClose={() => setBeta(false)} />
	) : (
		<StandardDashboard />
	);
};
```

## 🔀 Component switching with `withFeatures`

Render the **first enabled** flag's component (priority follows key order); fall back when none match. Lazy components are wrapped in `<Suspense>` with your `loading` node:

```tsx
import { lazy } from 'react';
import { withFeatures } from '#libs/feature';
import { CheckoutV2 } from './Checkout.v2.tsx';

export const Checkout = withFeatures({
	loading: <Spinner />,
	fallback: <CheckoutLegacy />,
	features: {
		CHECKOUT_V2: CheckoutV2, // tried first
		CHECKOUT_V1: lazy(() => import('./Checkout.v1.tsx')),
	},
});

// elsewhere: <Checkout /> — picks the variant for whichever flag is on
```

## 💾 Storage-driven flags

Mirror web-storage keys into the handler so you (or QA) can flip flags from devtools and see them apply **live**:

```tsx
import { linkStorageToFeatureHandler } from '#libs/feature';
import { features } from './app.features.ts';

linkStorageToFeatureHandler(features); // default prefix '::'
```

```js
// in the browser console — keys are coerced: '1' | 'true' → on
localStorage.setItem('::BETA_DASHBOARD', 'true');
sessionStorage.setItem('::PROMO_BANNER', '1'); // session wins over local
```

It seeds from existing prefixed keys on call and subscribes to the `storage` event for cross-tab updates.

## 🍳 Recipes

### React to changes outside the React tree

```typescript
features.addOnChangeListener(({ changedFeatures }) => {
	analytics.track('feature_changed', changedFeatures);
});
```

### Batch updates (one render, one event)

```typescript
features.setAll({ NEW_CHECKOUT: false, BETA_DASHBOARD: true });
```

### Read without subscribing (e.g. in a handler)

```tsx
const handler = useFeatureHandler();
const onClick = () => handler.get('NEW_CHECKOUT') && doThing();
```

## 🧪 Testing

Provide a handler seeded for the scenario under test:

```tsx
import { render, screen } from '@testing-library/react';
import { FeatureHandler, FeatureProvider } from '#libs/feature';

it('shows the beta dashboard when enabled', () => {
	const features = new FeatureHandler({ BETA_DASHBOARD: true });

	render(
		<FeatureProvider handler={features}>
			<Dashboard />
		</FeatureProvider>,
	);

	expect(screen.getByText('Beta')).toBeInTheDocument();
});
```

> `useFeature` / `useFeatureHandler` throw a `FeatureContextException` when used outside a `FeatureProvider` — always wrap the tree under test.

## 🧠 How it works

`FeatureHandler` keeps a `{ name: boolean }` lookup and an `EventTarget`. `set`/`setAll` mutate the lookup and dispatch a `FeatureChangedEvent` **only for values that actually changed** (no-op writes stay silent). `FeatureProvider` puts the handler on React Context; `useFeature` reads the initial value, subscribes on mount, and `setState`s when its flag appears in `changedFeatures`. `withFeatures` listens too, recomputing which variant to show. `linkStorageToFeatureHandler` translates prefixed storage keys into `setAll` + a `storage` listener.
