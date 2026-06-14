import { z } from 'zod';

/**
 * PokeAPI "named resource" reference ({ name, url }).
 */
export const NamedResourceSchema = z.object({
	name: z.string(),
	url: z.string(),
});

export type NamedResource = z.infer<typeof NamedResourceSchema>;
