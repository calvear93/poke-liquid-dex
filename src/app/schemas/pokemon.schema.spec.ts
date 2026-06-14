import { describe, expect, test } from 'vitest';
import { type PokemonApi, toPokemonModel } from './pokemon.schema.ts';

const raw: PokemonApi = {
	id: 6,
	cries: { latest: 'cry.ogg', legacy: null },
	height: 17,
	name: 'charizard',
	species: { name: 'charizard', url: 'sp/6' },
	stats: [{ base_stat: 78, stat: { name: 'hp', url: '' } }],
	weight: 905,
	abilities: [
		{ ability: { name: 'solar-power', url: 'a/solar' }, is_hidden: true },
	],
	moves: Array.from({ length: 30 }, (_, index) => ({
		move: { name: `m${index}`, url: `mv/${index}` },
	})),
	types: [
		{ slot: 2, type: { name: 'flying', url: '' } },
		{ slot: 1, type: { name: 'fire', url: '' } },
	],
};

describe('toPokemonModel', () => {
	const model = toPokemonModel(raw);

	test('orders types by slot', () => {
		expect(model.types).toStrictEqual(['fire', 'flying']);
	});

	test('normalizes abilities and stats', () => {
		expect(model.abilities[0]).toStrictEqual({
			hidden: true,
			slug: 'solar-power',
			url: 'a/solar',
		});
		expect(model.stats[0]).toStrictEqual({ key: 'hp', value: 78 });
	});

	test('keeps the total move count but trims the list to 18', () => {
		expect(model.movesTotal).toBe(30);
		expect(model.moves).toHaveLength(18);
	});

	test('picks the latest cry and the species url', () => {
		expect(model.cry).toBe('cry.ogg');
		expect(model.speciesUrl).toBe('sp/6');
	});
});
