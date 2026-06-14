import { type KvCache } from '#libs/cache';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { type AppConfig } from '../app.config.ts';
import { PokeApiService } from './pokeapi.service.ts';

const config: AppConfig = {
	apiUrl: 'https://api',
	artworkUrl: 'https://art',
	cacheVersion: 'v1',
	criesUrl: 'https://cries',
	maxDex: 1025,
	spriteUrl: 'https://sprite',
};

const makeCache = (): KvCache & { store: Map<string, unknown> } => {
	const store = new Map<string, unknown>();

	return {
		store,
		estimateBytes: () => Promise.resolve(1024),
		ready: () => Promise.resolve(),
		clear: (): Promise<void> => {
			store.clear();

			return Promise.resolve();
		},
		get: <T>(key: string): Promise<T | null> =>
			Promise.resolve((store.get(key) as T) ?? null),
		set: (key: string, value: unknown): void => {
			store.set(key, value);
		},
	};
};

const json = (data: unknown): Response =>
	({ ok: true, status: 200, json: () => Promise.resolve(data) }) as Response;

const pokemonPayload = (id: number, name: string): unknown => ({
	id,
	cries: { latest: 'c.ogg', legacy: null },
	height: 7,
	moves: [],
	name,
	species: { name, url: `${config.apiUrl}/pokemon-species/${id}/` },
	stats: [{ base_stat: 45, stat: { name: 'hp', url: '' } }],
	types: [{ slot: 1, type: { name: 'grass', url: '' } }],
	weight: 69,
	abilities: [
		{ ability: { name: 'overgrow', url: 'a/o' }, is_hidden: false },
	],
});

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('PokeApiService', () => {
	test('builds artwork / shiny / sprite urls from config', () => {
		const service = new PokeApiService(config, makeCache());

		expect(service.artwork(6)).toBe('https://art/6.png');
		expect(service.shinyArtwork(6)).toBe('https://art/shiny/6.png');
		expect(service.sprite(6)).toBe('https://sprite/6.png');
	});

	test('getAll filters beyond maxDex, sorts, and caches', async () => {
		const cache = makeCache();
		const service = new PokeApiService(config, cache);
		fetchMock.mockResolvedValue(
			json({
				results: [
					{ name: 'b', url: `${config.apiUrl}/pokemon/2/` },
					{ name: 'a', url: `${config.apiUrl}/pokemon/1/` },
					{ name: 'mega', url: `${config.apiUrl}/pokemon/10034/` },
				],
			}),
		);

		const list = await service.getAll();

		expect(list).toStrictEqual([
			{ id: 1, name: 'a' },
			{ id: 2, name: 'b' },
		]);
		expect(cache.store.get('all')).toStrictEqual(list);

		// second call is served from cache (no extra fetch)
		await service.getAll();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	test('getPokemon validates, normalizes and caches', async () => {
		const cache = makeCache();
		const service = new PokeApiService(config, cache);
		fetchMock.mockResolvedValue(json(pokemonPayload(1, 'bulbasaur')));

		const model = await service.getPokemon(1);

		expect(model.name).toBe('bulbasaur');
		expect(model.types).toStrictEqual(['grass']);
		expect(cache.store.get('mon:1')).toBeDefined();

		await service.getPokemon(1);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	test('getTypeIds keeps ids within the dex and caches', async () => {
		const cache = makeCache();
		const service = new PokeApiService(config, cache);
		fetchMock.mockResolvedValue(
			json({
				pokemon: [
					{
						slot: 1,
						pokemon: {
							name: 'a',
							url: `${config.apiUrl}/pokemon/4/`,
						},
					},
					{
						slot: 1,
						pokemon: {
							name: 'x',
							url: `${config.apiUrl}/pokemon/10100/`,
						},
					},
				],
			}),
		);

		await expect(service.getTypeIds('fire')).resolves.toStrictEqual([4]);
	});

	test('getTypeIndex builds an id→types map from the type endpoints', async () => {
		const cache = makeCache();
		const service = new PokeApiService(config, cache);
		fetchMock.mockImplementation((url: string) => {
			const type = url.split('/').filter(Boolean).at(-1);
			const entries: Record<string, unknown> = {
				fire: {
					pokemon: [
						{
							slot: 1,
							pokemon: {
								name: 'charizard',
								url: `${config.apiUrl}/pokemon/6/`,
							},
						},
					],
				},
				flying: {
					pokemon: [
						{
							slot: 2,
							pokemon: {
								name: 'charizard',
								url: `${config.apiUrl}/pokemon/6/`,
							},
						},
					],
				},
			};

			return Promise.resolve(
				json(entries[type ?? ''] ?? { pokemon: [] }),
			);
		});

		const index = await service.getTypeIndex();

		// charizard (6) is fire (slot 1) + flying (slot 2), in slot order
		expect(index[6]).toStrictEqual(['fire', 'flying']);
	});

	test('translate returns Spanish names and caches the dictionary', async () => {
		const cache = makeCache();
		const service = new PokeApiService(config, cache);
		fetchMock.mockResolvedValue(
			json({
				names: [{ language: { name: 'es', url: '' }, name: 'Ascuas' }],
			}),
		);

		const names = await service.translate(['mv/ember']);

		expect(names).toStrictEqual(['Ascuas']);
		expect(cache.store.get('tr')).toStrictEqual({ ember: 'Ascuas' });

		// cached translations don't hit the network again
		await service.translate(['mv/ember']);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
