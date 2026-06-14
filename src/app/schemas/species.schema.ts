import { z } from 'zod';
import { capitalize } from '../utils/format.utils.ts';
import { NamedResourceSchema } from './named-resource.schema.ts';

const LocalizedNameSchema = z.object({
	language: NamedResourceSchema,
	name: z.string(),
});

/**
 * Pokémon species endpoint schema (trimmed to UI needs).
 */
export const SpeciesApiSchema = z.object({
	evolution_chain: z.object({ url: z.string() }).nullish(),
	name: z.string(),
	names: z.array(LocalizedNameSchema),
	flavor_text_entries: z.array(
		z.object({ flavor_text: z.string(), language: NamedResourceSchema }),
	),
	genera: z.array(
		z.object({ genus: z.string(), language: NamedResourceSchema }),
	),
	varieties: z.array(
		z.object({ is_default: z.boolean(), pokemon: NamedResourceSchema }),
	),
});

export type SpeciesApi = z.infer<typeof SpeciesApiSchema>;

/** Normalized species model (Spanish-first) used by the UI and cache. */
export interface SpeciesModel {
	displayName: string;
	evolutionUrl: string | null;
	flavor: string;
	genus: string;
	varieties: { isDefault: boolean; slug: string; url: string }[];
}

/** Maps a validated species payload to the compact {@link SpeciesModel}. */
export const toSpeciesModel = (raw: SpeciesApi): SpeciesModel => {
	const pickName = (lang: string): string | undefined =>
		raw.names.find((entry) => entry.language.name === lang)?.name;
	const pickGenus = (lang: string): string | undefined =>
		raw.genera.find((entry) => entry.language.name === lang)?.genus;
	const pickFlavor = (lang: string): string | undefined =>
		raw.flavor_text_entries.find((entry) => entry.language.name === lang)
			?.flavor_text;

	const flavor = (pickFlavor('es') ?? pickFlavor('en') ?? '')
		.replaceAll(/[\n\f\r]/gu, ' ')
		.replaceAll(/\s+/gu, ' ')
		.trim();

	return {
		displayName: pickName('es') ?? pickName('en') ?? capitalize(raw.name),
		evolutionUrl: raw.evolution_chain?.url ?? null,
		flavor: flavor || 'Sin descripción disponible.',
		genus: pickGenus('es') ?? pickGenus('en') ?? '',
		varieties: raw.varieties.map((entry) => ({
			isDefault: entry.is_default,
			slug: entry.pokemon.name,
			url: entry.pokemon.url,
		})),
	};
};
