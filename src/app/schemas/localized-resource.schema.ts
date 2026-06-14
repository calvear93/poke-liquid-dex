import { z } from 'zod';
import { NamedResourceSchema } from './named-resource.schema.ts';

/**
 * Any resource exposing localized `names` (ability, move, …). Used to
 * translate slugs to Spanish for the detail view.
 */
export const LocalizedResourceSchema = z.object({
	names: z.array(
		z.object({ language: NamedResourceSchema, name: z.string() }),
	),
});

export type LocalizedResource = z.infer<typeof LocalizedResourceSchema>;
