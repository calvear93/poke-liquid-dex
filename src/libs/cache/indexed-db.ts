/**
 * Thin async wrapper around a single-store IndexedDB database.
 *
 * @param dbName - database name (namespace + version)
 * @param storeName - object store name
 * @returns store accessor
 */
export const createIdbStore = (dbName: string, storeName = 'kv'): IdbStore => {
	let dbPromise: Promise<IDBDatabase> | null = null;

	const open = (): Promise<IDBDatabase> => {
		dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
			let request: IDBOpenDBRequest;

			try {
				request = globalThis.indexedDB.open(dbName, 1);
			} catch (error) {
				reject(
					error instanceof Error
						? error
						: new Error('idb open failed'),
				);

				return;
			}

			request.addEventListener('upgradeneeded', () => {
				const db = request.result;

				if (!db.objectStoreNames.contains(storeName)) {
					db.createObjectStore(storeName);
				}
			});
			request.addEventListener('success', () => resolve(request.result));
			request.addEventListener('error', () =>
				reject(request.error ?? new Error('idb open failed')),
			);
		});

		return dbPromise;
	};

	const tx = async (mode: IDBTransactionMode): Promise<IDBObjectStore> => {
		const db = await open();

		return db.transaction(storeName, mode).objectStore(storeName);
	};

	return {
		available: async (): Promise<boolean> => {
			try {
				await open();

				return true;
			} catch {
				return false;
			}
		},
		clear: async (): Promise<void> => {
			try {
				const store = await tx('readwrite');

				await new Promise<void>((resolve) => {
					const request = store.clear();
					request.addEventListener('success', () => resolve());
					request.addEventListener('error', () => resolve());
				});
			} catch {
				// ignore
			}
		},
		close: (): void => {
			if (!dbPromise) return;

			const current = dbPromise;
			dbPromise = null;

			void (async () => {
				try {
					(await current).close();
				} catch {
					// ignore
				}
			})();
		},
		deleteDatabase: (): Promise<void> =>
			new Promise<void>((resolve) => {
				try {
					const request = globalThis.indexedDB.deleteDatabase(dbName);
					request.addEventListener('success', () => resolve());
					request.addEventListener('error', () => resolve());
					request.addEventListener('blocked', () => resolve());
				} catch {
					resolve();
				}
			}),
		get: async <T>(key: string): Promise<T | null> => {
			try {
				const store = await tx('readonly');

				return await new Promise<T | null>((resolve) => {
					const request = store.get(key);
					request.addEventListener('success', () =>
						resolve((request.result as T) ?? null),
					);
					request.addEventListener('error', () => resolve(null));
				});
			} catch {
				return null;
			}
		},
		set: async (key: string, value: unknown): Promise<void> => {
			try {
				const store = await tx('readwrite');

				await new Promise<void>((resolve) => {
					const request = store.put(value, key);
					request.addEventListener('success', () => resolve());
					request.addEventListener('error', () => resolve());
				});
			} catch {
				// persistence is best-effort
			}
		},
	};
};

export interface IdbStore {
	available(): Promise<boolean>;
	clear(): Promise<void>;
	close(): void;
	deleteDatabase(): Promise<void>;
	get<T>(key: string): Promise<T | null>;
	set(key: string, value: unknown): Promise<void>;
}
