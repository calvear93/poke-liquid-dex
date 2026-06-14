import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { GENERATIONS } from '../constants/pokedex.constants.ts';
import { type PokemonListItem } from '../schemas/pokemon-list.schema.ts';
import { dexNumber } from '../utils/format.utils.ts';
import { favoritesAtom } from './favorites.atom.ts';
import { allPokemonAtom, typeIdsAtom } from './pokemon.atom.ts';

/** Persisted current generation (1-9). */
export const generationAtom = atomWithStorage('pokedex:gen', 1);

export const searchAtom = atom('');
export const activeTypeAtom = atom<string | null>(null);
export const showFavoritesAtom = atom(false);

/** True when any global filter (search/type/favorites) overrides the generation. */
export const isFilteringAtom = atom((get) =>
	Boolean(get(searchAtom) || get(activeTypeAtom) || get(showFavoritesAtom)),
);

/**
 * The list currently shown in the grid, derived from generation + filters.
 * Async because it awaits the (cached) dex list and, when a type is active, the
 * (cached) set of ids for that type.
 */
export const visibleListAtom = atom(async (get): Promise<PokemonListItem[]> => {
	const all = await get(allPokemonAtom);
	const query = get(searchAtom).trim().toLowerCase();
	const type = get(activeTypeAtom);
	const showFavorites = get(showFavoritesAtom);
	const favorites = get(favoritesAtom);
	const generation = get(generationAtom);

	let base: PokemonListItem[];

	if (showFavorites) {
		base = all.filter((entry) => favorites.includes(entry.id));
	} else if (query || type) {
		base = all;
	} else {
		const range =
			GENERATIONS.find((item) => item.n === generation) ?? GENERATIONS[0];
		base = all.filter(
			(entry) => entry.id >= range.start && entry.id <= range.end,
		);
	}

	let list = base;

	if (type) {
		const ids = new Set(await get(typeIdsAtom(type)));
		list = list.filter((entry) => ids.has(entry.id));
	}

	if (query) {
		list = list.filter(
			(entry) =>
				entry.name.includes(query) ||
				String(entry.id) === query ||
				dexNumber(entry.id).includes(query),
		);
	}

	return list;
});
