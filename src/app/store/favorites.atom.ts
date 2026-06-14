import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

/** Persisted set of favorite Pokémon ids (localStorage). */
export const favoritesAtom = atomWithStorage<number[]>('pokedex:favorites', []);

/** Write-only atom that toggles a favorite by id. */
export const toggleFavoriteAtom = atom(null, (get, set, id: number) => {
	const current = get(favoritesAtom);

	set(
		favoritesAtom,
		current.includes(id)
			? current.filter((value) => value !== id)
			: [...current, id],
	);
});
