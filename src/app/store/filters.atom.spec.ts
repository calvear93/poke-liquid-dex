import { createStore } from 'jotai';
import { beforeEach, describe, expect, test } from 'vitest';
import { type PokemonListItem } from '../schemas/pokemon-list.schema.ts';
import { type PokeApiService } from '../services/pokeapi.service.ts';
import { favoritesAtom } from './favorites.atom.ts';
import {
	activeTypeAtom,
	generationAtom,
	searchAtom,
	showFavoritesAtom,
	visibleListAtom,
} from './filters.atom.ts';
import { serviceAtom } from './service.atom.ts';

const DEX: PokemonListItem[] = [
	{ id: 1, name: 'bulbasaur' },
	{ id: 4, name: 'charmander' },
	{ id: 152, name: 'chikorita' },
];

const mockService = {
	getAll: () => Promise.resolve(DEX),
	getTypeIds: (type: string) => Promise.resolve(type === 'fire' ? [4] : []),
} as unknown as PokeApiService;

const makeStore = (): ReturnType<typeof createStore> => {
	const store = createStore();
	store.set(serviceAtom, mockService);

	return store;
};

const ids = (list: PokemonListItem[]): number[] => list.map((item) => item.id);

describe('visibleListAtom', () => {
	beforeEach(() => globalThis.localStorage.clear());

	test('shows the current generation by default', async () => {
		const store = makeStore();
		store.set(generationAtom, 1);

		expect(ids(await store.get(visibleListAtom))).toStrictEqual([1, 4]);
	});

	test('search matches name across the whole dex', async () => {
		const store = makeStore();
		store.set(searchAtom, 'chi');

		expect(ids(await store.get(visibleListAtom))).toStrictEqual([152]);
	});

	test('type filter intersects the dex with the type ids', async () => {
		const store = makeStore();
		store.set(activeTypeAtom, 'fire');

		expect(ids(await store.get(visibleListAtom))).toStrictEqual([4]);
	});

	test('favorites view lists only favorites', async () => {
		const store = makeStore();
		store.set(favoritesAtom, [152]);
		store.set(showFavoritesAtom, true);

		expect(ids(await store.get(visibleListAtom))).toStrictEqual([152]);
	});
});
