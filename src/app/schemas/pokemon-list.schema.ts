import { z } from 'zod';
import { NamedResourceSchema } from './named-resource.schema.ts';

/** Paginated list endpoint (we request the whole dex at once). */
export const PokemonListApiSchema = z.object({
	results: z.array(NamedResourceSchema),
});

export type PokemonListApi = z.infer<typeof PokemonListApiSchema>;

/** Minimal entry kept for the grid + search index. */
export interface PokemonListItem {
	id: number;
	name: string;
}
