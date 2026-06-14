import { describe, expect, test } from 'vitest';
import { type EvolutionLinkApi } from '../schemas/evolution.schema.ts';
import { flattenEvolution } from './evolution.utils.ts';

const chain: EvolutionLinkApi = {
	species: { name: 'charmander', url: 'https://x/pokemon-species/4/' },
	evolves_to: [
		{
			evolves_to: [
				{
					evolves_to: [],
					species: {
						name: 'charizard',
						url: 'https://x/pokemon-species/6/',
					},
				},
			],
			species: {
				name: 'charmeleon',
				url: 'https://x/pokemon-species/5/',
			},
		},
	],
};

describe('flattenEvolution', () => {
	test('flattens the chain depth-first with ids', () => {
		expect(flattenEvolution(chain)).toStrictEqual([
			{ id: 4, name: 'charmander' },
			{ id: 5, name: 'charmeleon' },
			{ id: 6, name: 'charizard' },
		]);
	});

	test('handles branching chains (e.g. eevee)', () => {
		const eevee: EvolutionLinkApi = {
			species: { name: 'eevee', url: 'https://x/pokemon-species/133/' },
			evolves_to: [
				{
					evolves_to: [],
					species: {
						name: 'vaporeon',
						url: 'https://x/pokemon-species/134/',
					},
				},
				{
					evolves_to: [],
					species: {
						name: 'jolteon',
						url: 'https://x/pokemon-species/135/',
					},
				},
			],
		};

		expect(flattenEvolution(eevee).map((stage) => stage.id)).toStrictEqual([
			133, 134, 135,
		]);
	});
});
