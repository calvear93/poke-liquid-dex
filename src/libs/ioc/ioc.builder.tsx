import { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

// react context for the IoC container
const IoCContext = createContext<Map<unknown, unknown> | null>(null);

/**
 * Creates a new Inversion of Control container.
 *
 * @example
 * ```ts
 *	// app.ioc.ts
 *	import { createContainer } from '#libs/ioc';
 *
 *	export const { container, useInjection } = createContainer();
 *	// tokens
 *	export const MY_CUSTOM_PROVIDER = 'custom_provider';
 *	// bindings
 *	container.bind(HttpClient, new HttpClient()); // bind using a class
 *	container.bind(MY_CUSTOM_PROVIDER, new MyCustomProvider()); // bind using a injection token
 *
 *	// AnyComponent.ts
 *	import { useInjection, MY_CUSTOM_PROVIDER } from './app.ioc.ts';
 *
 *	export const AnyComponent: React.FC = (): React.ReactElement => {
 *		const httpClient = useInjection(HttpClient);
 *		const myCustomProvider = useInjection<MyCustomProvider>(MY_CUSTOM_PROVIDER);
 *
 *		...
 *	};
 *```
 */
export const createContainer = () => {
	const container = new Map<unknown, unknown>();

	return {
		container: {
			bind: (key: unknown, value: unknown) => {
				container.set(key, value);
			},
			resolve: <
				T,
				K = unknown,
				R = K extends { new (...args: never[]): infer C } ? C : T,
			>(
				key: K,
			): R => {
				return container.get(key) as R;
			},
			unbind: (key: unknown) => {
				container.delete(key);
			},
		},
		InversionOfControlProvider: ({
			children,
			values,
		}: InversionOfControlProviderProps) => {
			const contextContainer = useMemo(() => {
				// if values is provided, use only those values (don't merge with global container)
				// if values is not provided, use the global container
				return new Map(values ?? container);
			}, [values]);

			return (
				<IoCContext.Provider value={contextContainer}>
					{children}
				</IoCContext.Provider>
			);
		},
		useInjection: <
			T,
			K = unknown,
			R = K extends { new (...args: never[]): infer C } ? C : T,
		>(
			key: K,
		): R => {
			const context = useContext(IoCContext);
			// if we're inside a provider, use the context value
			// otherwise, fall back to the global containerMap
			const map = context ?? container;
			return map.get(key) as R;
		},
	};
};

export interface InversionOfControlProviderProps extends PropsWithChildren {
	values?: Map<unknown, unknown>;
}
