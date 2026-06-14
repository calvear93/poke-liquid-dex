# 🗃️ store (Jotai)

Application state **and the in-memory data cache**, built with Jotai. This folder
replaces the template's `app/atoms/` so "atoms" (Jotai state) doesn't clash with
the atomic-design UI under `components/atoms`.

## Files

- `service.atom.ts` — bridges the IoC `PokeApiService` to atoms (atoms can't use
  the `useInjection` hook). Tests override it via a Jotai `Provider`/store.
- `pokemon.atom.ts` — read-through data atoms: `allPokemonAtom` and the
  `atomFamily` members `pokemonAtom` / `speciesAtom` / `evolutionAtom` /
  `typeIdsAtom`. Each resolves from the service (cache → network), so Jotai
  dedupes and memoizes results across the app (Suspense-friendly).
- `filters.atom.ts` — `searchAtom`, `activeTypeAtom`, `showFavoritesAtom`,
  `generationAtom` (persisted) and the derived `visibleListAtom`.
- `favorites.atom.ts` — favorites persisted with `atomWithStorage`.
- `theme.atom.ts` — theme preference (`auto`/`light`/`dark`), persisted.
- `compare.atom.ts` — comparison tray, selected detail id and the derived
  `compareModelsAtom`.

## Caching model

Jotai is the **live cache** (the `atomFamily` holds resolved values). Persistence
lives one layer below in the service via [`#libs/cache`](../../libs/cache/README.md)
(IndexedDB with a localStorage fallback). Preferences (favorites/theme/generation)
persist directly through `atomWithStorage`.
