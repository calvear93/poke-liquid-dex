import { createIdbStore } from './indexed-db.ts';
import { createLocalStore } from './local.store.ts';

/**
 * Creates an async key/value cache that prefers IndexedDB (large quota) and
 * falls back to localStorage. Reads are async; writes are fire-and-forget so
 * persistence never blocks the UI.
 *
 * @param namespace - unique cache namespace (include a version)
 * @returns cache accessor
 */
export const createKvCache = (namespace: string): KvCache => {
	const idb = createIdbStore(namespace);
	const local = createLocalStore(`${namespace}:`);

	let useIdb = false;
	let readyPromise: Promise<void> | null = null;

	const ready = (): Promise<void> => {
		readyPromise ??= idb.available().then((ok) => {
			useIdb = ok;
		});

		return readyPromise;
	};

	return {
		ready,
		clear: async (): Promise<void> => {
			await ready();
			idb.close();
			await idb.deleteDatabase();
			local.clear();
		},
		estimateBytes: async (): Promise<number | null> => {
			try {
				const estimate = await navigator.storage?.estimate?.();

				return estimate?.usage ?? null;
			} catch {
				return null;
			}
		},
		get: async <T>(key: string): Promise<T | null> => {
			await ready();

			if (useIdb) {
				const value = await idb.get<T>(key);

				if (value !== null) return value;
			}

			return local.get<T>(key);
		},
		set: (key: string, value: unknown): void => {
			void ready().then(() => {
				if (useIdb) void idb.set(key, value);
				else local.set(key, value);
			});
		},
	};
};

export interface KvCache {
	clear(): Promise<void>;
	estimateBytes(): Promise<number | null>;
	get<T>(key: string): Promise<T | null>;
	ready(): Promise<void>;
	set(key: string, value: unknown): void;
}
