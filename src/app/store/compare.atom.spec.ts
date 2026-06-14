import { createStore } from 'jotai';
import { describe, expect, test } from 'vitest';
import {
	clearCompareAtom,
	compareAtom,
	toggleCompareAtom,
} from './compare.atom.ts';

const toggle = (store: ReturnType<typeof createStore>, id: number): void => {
	store.set(toggleCompareAtom, id);
};

describe('compare', () => {
	test('toggles ids and caps the selection at three (drops the oldest)', () => {
		const store = createStore();

		for (const id of [1, 2, 3, 4]) toggle(store, id);

		expect(store.get(compareAtom)).toStrictEqual([2, 3, 4]);
	});

	test('removing a selected id and clearing the tray', () => {
		const store = createStore();

		for (const id of [1, 2, 1]) toggle(store, id);
		expect(store.get(compareAtom)).toStrictEqual([2]);

		store.set(clearCompareAtom);
		expect(store.get(compareAtom)).toStrictEqual([]);
	});
});
