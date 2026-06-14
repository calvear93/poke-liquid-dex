import { describe, expect, test } from 'vitest';
import {
	capitalize,
	dexNumber,
	humanize,
	idFromUrl,
	slugFromUrl,
	toKilograms,
	toMeters,
} from './format.utils.ts';

describe('format utils', () => {
	test('capitalize upper-cases the first letter', () => {
		expect(capitalize('pikachu')).toBe('Pikachu');
		expect(capitalize('')).toBe('');
	});

	test('humanize replaces dashes with spaces', () => {
		expect(humanize('special-attack')).toBe('special attack');
	});

	test('dexNumber pads to three digits', () => {
		expect(dexNumber(6)).toBe('#006');
		expect(dexNumber(1025)).toBe('#1025');
	});

	test('idFromUrl extracts the trailing id', () => {
		expect(idFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
	});

	test('slugFromUrl extracts the trailing slug', () => {
		expect(slugFromUrl('https://pokeapi.co/api/v2/ability/blaze/')).toBe(
			'blaze',
		);
	});

	test('toMeters / toKilograms use a Spanish decimal comma', () => {
		expect(toMeters(17)).toBe('1,7');
		expect(toKilograms(905)).toBe('90,5');
	});
});
