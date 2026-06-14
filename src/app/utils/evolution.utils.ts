import {
	type EvolutionLinkApi,
	type EvolutionStage,
} from '../schemas/evolution.schema.ts';
import { idFromUrl } from './format.utils.ts';

/**
 * Flattens an evolution chain (depth-first) into an ordered list of stages.
 */
export const flattenEvolution = (chain: EvolutionLinkApi): EvolutionStage[] => {
	const stages: EvolutionStage[] = [];

	const walk = (node: EvolutionLinkApi): void => {
		stages.push({
			id: idFromUrl(node.species.url),
			name: node.species.name,
		});
		for (const child of node.evolves_to) walk(child);
	};

	walk(chain);

	return stages;
};
