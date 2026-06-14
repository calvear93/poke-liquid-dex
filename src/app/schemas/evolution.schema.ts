import { z } from 'zod';
import { NamedResourceSchema } from './named-resource.schema.ts';

/** A node in the (recursive) evolution chain. */
export interface EvolutionLinkApi {
	evolves_to: EvolutionLinkApi[];
	species: { name: string; url: string };
}

export const EvolutionLinkSchema: z.ZodType<EvolutionLinkApi> = z.lazy(() =>
	z.object({
		evolves_to: z.array(EvolutionLinkSchema),
		species: NamedResourceSchema,
	}),
);

export const EvolutionApiSchema = z.object({
	chain: EvolutionLinkSchema,
});

export type EvolutionApi = z.infer<typeof EvolutionApiSchema>;

export interface EvolutionStage {
	id: number;
	name: string;
}

/** Flattened evolution chain used by the UI. */
export interface EvolutionModel {
	stages: EvolutionStage[];
}
