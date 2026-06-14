import { describe, expect, test } from 'vitest';
import { type SpeciesApi, toSpeciesModel } from './species.schema.ts';

const raw: SpeciesApi = {
	evolution_chain: { url: 'evo/2' },
	genera: [{ genus: 'Pokémon Llama', language: { name: 'es', url: '' } }],
	name: 'charizard',
	flavor_text_entries: [
		{
			flavor_text: 'Escupe\nun fuego\fmuy caliente.',
			language: { name: 'es', url: '' },
		},
	],
	names: [
		{ language: { name: 'es', url: '' }, name: 'Charizard' },
		{ language: { name: 'en', url: '' }, name: 'Charizard EN' },
	],
	varieties: [
		{ is_default: true, pokemon: { name: 'charizard', url: 'p/6' } },
		{
			is_default: false,
			pokemon: { name: 'charizard-mega-x', url: 'p/10034' },
		},
	],
};

describe('toSpeciesModel', () => {
	const model = toSpeciesModel(raw);

	test('prefers the Spanish name and genus', () => {
		expect(model.displayName).toBe('Charizard');
		expect(model.genus).toBe('Pokémon Llama');
	});

	test('cleans whitespace control chars in the flavor text', () => {
		expect(model.flavor).toBe('Escupe un fuego muy caliente.');
	});

	test('maps varieties and the evolution url', () => {
		expect(model.evolutionUrl).toBe('evo/2');
		expect(model.varieties).toHaveLength(2);
		expect(model.varieties[1]).toStrictEqual({
			isDefault: false,
			slug: 'charizard-mega-x',
			url: 'p/10034',
		});
	});

	test('falls back when no description exists', () => {
		const model = toSpeciesModel({ ...raw, flavor_text_entries: [] });

		expect(model.flavor).toBe('Sin descripción disponible.');
	});
});
