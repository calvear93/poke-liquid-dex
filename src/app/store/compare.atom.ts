import { atom } from 'jotai';
import { type PokemonModel } from '../schemas/pokemon.schema.ts';
import { pokemonAtom } from './pokemon.atom.ts';

const MAX_COMPARE = 3;

/** Ids selected for comparison (max 3). */
export const compareAtom = atom<number[]>([]);

/** Whether the comparison modal is open. */
export const compareOpenAtom = atom(false);

/** Currently open detail id (`null` when the detail sheet is closed). */
export const selectedDetailAtom = atom<number | null>(null);

/** Write-only atom to toggle a Pokémon in the comparison tray. */
export const toggleCompareAtom = atom(null, (get, set, id: number) => {
	const current = get(compareAtom);

	if (current.includes(id)) {
		set(
			compareAtom,
			current.filter((value) => value !== id),
		);

		return;
	}

	set(
		compareAtom,
		current.length >= MAX_COMPARE
			? [...current.slice(1), id]
			: [...current, id],
	);
});

/** Write-only atom to empty the comparison tray. */
export const clearCompareAtom = atom(null, (_get, set) => {
	set(compareAtom, []);
});

/** Resolved models for the Pokémon currently selected for comparison. */
export const compareModelsAtom = atom(
	(get): Promise<PokemonModel[]> =>
		Promise.all(get(compareAtom).map((id) => get(pokemonAtom(id)))),
);
