import { render, type RenderResult } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactElement } from 'react';
import { InversionOfControlProvider } from '../app.ioc.ts';
import { PokeApiService } from '../services/pokeapi.service.ts';
import { serviceAtom } from '../store/service.atom.ts';

// happy-dom lacks IntersectionObserver / matchMedia — provide minimal shims so
// components that rely on them render in tests.
class TestIntersectionObserver {
	disconnect(): void {}

	observe(target: Element): void {
		this._callback(
			[{ isIntersecting: true, target } as IntersectionObserverEntry],
			this as unknown as IntersectionObserver,
		);
	}

	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}

	unobserve(): void {}
	constructor(callback: IntersectionObserverCallback) {
		this._callback = callback;
	}
	private readonly _callback: IntersectionObserverCallback;
}

globalThis.IntersectionObserver ??=
	TestIntersectionObserver as unknown as typeof IntersectionObserver;

globalThis.matchMedia ??= ((query: string) =>
	({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: () => {},
		addListener: () => {},
		dispatchEvent: () => false,
		removeEventListener: () => {},
		removeListener: () => {},
	}) as MediaQueryList) as typeof globalThis.matchMedia;

/** A mock PokeApiService with sensible defaults; override per test. */
export const makeMockService = (
	overrides: Partial<PokeApiService> = {},
): PokeApiService =>
	({
		artwork: (id: number) => `art/${id}.png`,
		clearCache: () => Promise.resolve(),
		estimateCacheBytes: () => Promise.resolve(2 * 1_048_576),
		getTypeIds: () => Promise.resolve([4]),
		shinyArtwork: (id: number) => `shiny/${id}.png`,
		sprite: (id: number) => `sprite/${id}.png`,
		translate: (urls: string[]) => Promise.resolve(urls.map(() => '')),
		getAll: () =>
			Promise.resolve([
				{ id: 1, name: 'bulbasaur' },
				{ id: 4, name: 'charmander' },
			]),
		getEvolution: () =>
			Promise.resolve({
				stages: [
					{ id: 1, name: 'bulbasaur' },
					{ id: 2, name: 'ivysaur' },
				],
			}),
		getPokemon: (id: number) =>
			Promise.resolve({
				id,
				cry: null,
				height: 7,
				moves: [{ slug: 'tackle', url: 'm/tackle' }],
				movesTotal: 1,
				name: id === 1 ? 'bulbasaur' : 'charmander',
				speciesUrl: `sp/${id}`,
				types: ['grass', 'poison'],
				weight: 69,
				abilities: [
					{ hidden: false, slug: 'overgrow', url: 'a/overgrow' },
					{ hidden: true, slug: 'chlorophyll', url: 'a/chlorophyll' },
				],
				stats: [
					{ key: 'hp', value: 45 },
					{ key: 'attack', value: 49 },
					{ key: 'defense', value: 49 },
					{ key: 'special-attack', value: 65 },
					{ key: 'special-defense', value: 65 },
					{ key: 'speed', value: 45 },
				],
			}),
		getSpecies: () =>
			Promise.resolve({
				displayName: 'Bulbasaur',
				evolutionUrl: 'evo/1',
				flavor: 'Una rara semilla fue plantada en su espalda.',
				genus: 'Pokémon Semilla',
				varieties: [
					{ isDefault: true, slug: 'bulbasaur', url: 'p/1' },
					{
						isDefault: false,
						slug: 'bulbasaur-gmax',
						url: 'p/10186',
					},
				],
			}),
		...overrides,
	}) as unknown as PokeApiService;

/** Renders `ui` wired to a mock service via IoC + the Jotai service atom. */
export const renderWithProviders = (
	ui: ReactElement,
	options: {
		service?: PokeApiService;
		store?: ReturnType<typeof createStore>;
	} = {},
): RenderResult & { store: ReturnType<typeof createStore> } => {
	const service = options.service ?? makeMockService();
	const store = options.store ?? createStore();
	store.set(serviceAtom, service);

	const values = new Map<unknown, unknown>();
	values.set(PokeApiService, service);

	const result = render(
		<InversionOfControlProvider values={values}>
			<Provider store={store}>{ui}</Provider>
		</InversionOfControlProvider>,
	);

	return { ...result, store };
};
