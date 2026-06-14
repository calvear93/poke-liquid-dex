/**
 * Static Pokédex reference data: type colors, Spanish labels, generations.
 */

/** Brand color per Pokémon type (used for tints and badges). */
export const TYPE_COLOR: Readonly<Record<string, string>> = {
	bug: '#90c12c',
	dark: '#5a5366',
	dragon: '#0a6dc4',
	electric: '#f4d23c',
	fairy: '#ec8fe6',
	fighting: '#ce4069',
	fire: '#ff9d55',
	flying: '#8fa8dd',
	ghost: '#5269ac',
	grass: '#63bc5a',
	ground: '#d97746',
	ice: '#73cec0',
	normal: '#9099a1',
	poison: '#ab6ac8',
	psychic: '#fa7179',
	rock: '#c7b78b',
	steel: '#5a8ea1',
	water: '#5090d6',
};

/** Spanish display name per Pokémon type. */
export const TYPE_ES: Readonly<Record<string, string>> = {
	bug: 'Bicho',
	dark: 'Siniestro',
	dragon: 'Dragón',
	electric: 'Eléctrico',
	fairy: 'Hada',
	fighting: 'Lucha',
	fire: 'Fuego',
	flying: 'Volador',
	ghost: 'Fantasma',
	grass: 'Planta',
	ground: 'Tierra',
	ice: 'Hielo',
	normal: 'Normal',
	poison: 'Veneno',
	psychic: 'Psíquico',
	rock: 'Roca',
	steel: 'Acero',
	water: 'Agua',
};

/** Spanish (short) display name per base stat. */
export const STAT_ES: Readonly<Record<string, string>> = {
	attack: 'Ataque',
	defense: 'Defensa',
	hp: 'PS',
	'special-attack': 'At. Esp.',
	'special-defense': 'Def. Esp.',
	speed: 'Velocidad',
};

/** Ordered list of types for the filter bar. */
export const TYPE_ORDER = [
	'normal',
	'fire',
	'water',
	'electric',
	'grass',
	'ice',
	'fighting',
	'poison',
	'ground',
	'flying',
	'psychic',
	'bug',
	'rock',
	'ghost',
	'dragon',
	'dark',
	'steel',
	'fairy',
] as const;

/** Distinct palette for radar polygons (kept high-contrast across overlaps). */
export const RADAR_PALETTE = ['#ff5e8a', '#5b8cff', '#ffb02e'] as const;

/** Order of base stats as rendered (radar + comparison). */
export const STAT_ORDER = [
	'hp',
	'attack',
	'defense',
	'special-attack',
	'special-defense',
	'speed',
] as const;

export interface Generation {
	readonly end: number;
	readonly n: number;
	readonly region: string;
	readonly roman: string;
	readonly start: number;
}

/** National-dex ranges per generation (by id). */
export const GENERATIONS: readonly Generation[] = [
	{ end: 151, n: 1, region: 'Kanto', roman: 'I', start: 1 },
	{ end: 251, n: 2, region: 'Johto', roman: 'II', start: 152 },
	{ end: 386, n: 3, region: 'Hoenn', roman: 'III', start: 252 },
	{ end: 493, n: 4, region: 'Sinnoh', roman: 'IV', start: 387 },
	{ end: 649, n: 5, region: 'Teselia', roman: 'V', start: 494 },
	{ end: 721, n: 6, region: 'Kalos', roman: 'VI', start: 650 },
	{ end: 809, n: 7, region: 'Alola', roman: 'VII', start: 722 },
	{ end: 905, n: 8, region: 'Galar', roman: 'VIII', start: 810 },
	{ end: 1025, n: 9, region: 'Paldea', roman: 'IX', start: 906 },
];
