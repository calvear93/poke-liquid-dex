# 💾 cache

Async key/value cache for persisting API data across reloads. Prefers
**IndexedDB** (large quota, no ~5 MB limit) and transparently falls back to
**localStorage** when IndexedDB is unavailable (e.g. private mode).

## Usage

```ts
import { createKvCache } from '#libs/cache';

const cache = createKvCache('pokedex-v1');

const cached = await cache.get<MyType>('key');
cache.set('key', value); // fire-and-forget, non-blocking
await cache.clear(); // wipes the IndexedDB database + namespaced localStorage keys
const bytes = await cache.estimateBytes(); // navigator.storage.estimate()
```

## Design

- `get` is async and reads IndexedDB first, then localStorage.
- `set` is fire-and-forget so persistence never blocks rendering.
- The localStorage fallback JSON-serializes values, namespaces keys by
  `"<namespace>:"`, and evicts ~30% of its own keys on quota errors.
- Include a **version** in the namespace; bump it to invalidate old caches.

This library is generic (no domain knowledge). Trimming/validation of payloads
lives in the consumer (e.g. `PokeApiService` + Zod schemas).
