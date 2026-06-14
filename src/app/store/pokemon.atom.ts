import { atom } from 'jotai';
import { unwrap } from 'jotai/utils';
import { type EvolutionModel } from '../schemas/evolution.schema.ts';
import { type PokemonListItem } from '../schemas/pokemon-list.schema.ts';
import { type PokemonModel } from '../schemas/pokemon.schema.ts';
import { type SpeciesModel } from '../schemas/species.schema.ts';
import { atomFamily } from './atom-family.util.ts';
import { serviceAtom } from './service.atom.ts';

/**
 * Read-through data atoms. Each `atomFamily` member is an async atom that the
 * service resolves from cache → network, so Jotai dedupes and memoizes the
 * cached value across the whole app (Suspense-friendly).
 */
export const allPokemonAtom = atom(
	(get): Promise<PokemonListItem[]> => get(serviceAtom).getAll(),
);

export const pokemonAtom = atomFamily((id: number) =>
	atom((get): Promise<PokemonModel> => get(serviceAtom).getPokemon(id)),
);

export const speciesAtom = atomFamily((url: string) =>
	atom((get): Promise<SpeciesModel> => get(serviceAtom).getSpecies(url)),
);

export const evolutionAtom = atomFamily((url: string) =>
	atom((get): Promise<EvolutionModel> => get(serviceAtom).getEvolution(url)),
);

export const typeIdsAtom = atomFamily((type: string) =>
	atom((get): Promise<number[]> => get(serviceAtom).getTypeIds(type)),
);

/**
 * `id → types[]` index for the whole dex, built once from the type endpoints.
 * `typeIndexValueAtom` is the non-suspending view (undefined until ready) the
 * grid reads, so cards render immediately and gain types/tints when it resolves.
 */
export const typeIndexAtom = atom(
	(get): Promise<Record<number, string[]>> => get(serviceAtom).getTypeIndex(),
);

export const typeIndexValueAtom = unwrap(typeIndexAtom);
