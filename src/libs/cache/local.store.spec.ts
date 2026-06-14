import { beforeEach, describe, expect, test } from 'vitest';
import { createLocalStore } from './local.store.ts';

describe('createLocalStore', () => {
	beforeEach(() => globalThis.localStorage.clear());

	test('stores and retrieves JSON values namespaced by prefix', () => {
		const store = createLocalStore('ns:');

		store.set('k', { a: 1 });

		expect(store.get('k')).toStrictEqual({ a: 1 });
		expect(globalThis.localStorage.getItem('ns:k')).toBe('{"a":1}');
	});

	test('returns null for missing keys', () => {
		expect(createLocalStore('ns:').get('missing')).toBeNull();
	});

	test('clear removes only its own namespace', () => {
		const store = createLocalStore('ns:');

		store.set('k', 1);
		globalThis.localStorage.setItem('other', 'x');
		store.clear();

		expect(store.get('k')).toBeNull();
		expect(globalThis.localStorage.getItem('other')).toBe('x');
	});
});
