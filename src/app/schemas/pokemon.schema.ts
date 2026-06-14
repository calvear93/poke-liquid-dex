import { z } from 'zod';
import { NamedResourceSchema } from './named-resource.schema.ts';

/**
 * Pokémon endpoint schema — only the fields the UI consumes (unknown fields
 * are stripped by Zod, which doubles as a trim before caching).
 */
export const PokemonApiSchema = z.object({
	id: z.number(),
	height: z.number(),
	moves: z.array(z.object({ move: NamedResourceSchema })),
	name: z.string(),
	species: NamedResourceSchema,
	types: z.array(z.object({ slot: z.number(), type: NamedResourceSchema })),
	weight: z.number(),
	abilities: z.array(
		z.object({ ability: NamedResourceSchema, is_hidden: z.boolean() }),
	),
	cries: z
		.object({
			latest: z.string().nullish(),
			legacy: z.string().nullish(),
		})
		.nullish(),
	stats: z.array(
		z.object({ base_stat: z.number(), stat: NamedResourceSchema }),
	),
});

export type PokemonApi = z.infer<typeof PokemonApiSchema>;

/** Normalized Pokémon model used by the UI and persisted in cache. */
export interface PokemonModel {
	id: number;
	abilities: { hidden: boolean; slug: string; url: string }[];
	cry: string | null;
	height: number;
	moves: { slug: string; url: string }[];
	movesTotal: number;
	name: string;
	speciesUrl: string;
	stats: { key: string; value: number }[];
	types: string[];
	weight: number;
}

/** Maps a validated API payload to the compact {@link PokemonModel}. */
export const toPokemonModel = (raw: PokemonApi): PokemonModel => ({
	id: raw.id,
	cry: raw.cries?.latest ?? raw.cries?.legacy ?? null,
	height: raw.height,
	movesTotal: raw.moves.length,
	name: raw.name,
	speciesUrl: raw.species.url,
	weight: raw.weight,
	abilities: raw.abilities.map((entry) => ({
		hidden: entry.is_hidden,
		slug: entry.ability.name,
		url: entry.ability.url,
	})),
	moves: raw.moves.slice(0, 18).map((entry) => ({
		slug: entry.move.name,
		url: entry.move.url,
	})),
	stats: raw.stats.map((entry) => ({
		key: entry.stat.name,
		value: entry.base_stat,
	})),
	types: [...raw.types]
		.sort((a, b) => a.slot - b.slot)
		.map((entry) => entry.type.name),
});
