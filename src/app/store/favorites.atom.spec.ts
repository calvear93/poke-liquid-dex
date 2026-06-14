import { createStore } from 'jotai';
import { beforeEach, describe, expect, test } from 'vitest';
import { favoritesAtom, toggleFavoriteAtom } from './favorites.atom.ts';

describe('favorites', () => {
	beforeEach(() => globalThis.localStorage.clear());

	test('toggles a favorite on and off', () => {
		const store = createStore();

		store.set(toggleFavoriteAtom, 6);
		expect(store.get(favoritesAtom)).toStrictEqual([6]);

		store.set(toggleFavoriteAtom, 6);
		expect(store.get(favoritesAtom)).toStrictEqual([]);
	});
});
