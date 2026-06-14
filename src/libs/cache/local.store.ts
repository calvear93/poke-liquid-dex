/**
 * localStorage-backed key/value store (fallback when IndexedDB is unavailable).
 * Values are JSON-serialized and namespaced by `prefix`; on quota errors it
 * evicts a portion of its own keys and retries once.
 *
 * @param prefix - key namespace
 * @returns store accessor
 */
export const createLocalStore = (prefix: string): LocalStore => {
	const keysOf = (): string[] => {
		const keys: string[] = [];

		for (
			let index = 0;
			index < globalThis.localStorage.length;
			index += 1
		) {
			const key = globalThis.localStorage.key(index);

			if (key?.startsWith(prefix)) keys.push(key);
		}

		return keys;
	};

	const evict = (): boolean => {
		try {
			const keys = keysOf();

			if (keys.length === 0) return false;

			for (const key of keys.slice(0, Math.ceil(keys.length * 0.3)))
				globalThis.localStorage.removeItem(key);

			return true;
		} catch {
			return false;
		}
	};

	return {
		clear: (): void => {
			try {
				for (const key of keysOf())
					globalThis.localStorage.removeItem(key);
			} catch {
				// ignore
			}
		},
		get: <T>(key: string): T | null => {
			try {
				const raw = globalThis.localStorage.getItem(prefix + key);

				return raw ? (JSON.parse(raw) as T) : null;
			} catch {
				return null;
			}
		},
		set: (key: string, value: unknown): void => {
			let raw: string;

			try {
				raw = JSON.stringify(value);
			} catch {
				return;
			}

			try {
				globalThis.localStorage.setItem(prefix + key, raw);
			} catch {
				if (evict()) {
					try {
						globalThis.localStorage.setItem(prefix + key, raw);
					} catch {
						// give up silently
					}
				}
			}
		},
	};
};

export interface LocalStore {
	clear(): void;
	get<T>(key: string): T | null;
	set(key: string, value: unknown): void;
}
