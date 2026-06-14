import { z } from 'zod';
import { NamedResourceSchema } from './named-resource.schema.ts';

/** Type endpoint: list of Pokémon that have a given type (with their slot). */
export const TypeApiSchema = z.object({
	pokemon: z.array(
		z.object({ slot: z.number(), pokemon: NamedResourceSchema }),
	),
});

export type TypeApi = z.infer<typeof TypeApiSchema>;
