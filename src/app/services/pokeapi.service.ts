import { type KvCache } from '#libs/cache';
import { type AppConfig } from '../app.config.ts';
import { TYPE_ORDER } from '../constants/pokedex.constants.ts';
import {
	EvolutionApiSchema,
	type EvolutionModel,
} from '../schemas/evolution.schema.ts';
import { LocalizedResourceSchema } from '../schemas/localized-resource.schema.ts';
import {
	PokemonListApiSchema,
	type PokemonListItem,
} from '../schemas/pokemon-list.schema.ts';
import {
	PokemonApiSchema,
	type PokemonModel,
	toPokemonModel,
} from '../schemas/pokemon.schema.ts';
import {
	SpeciesApiSchema,
	type SpeciesModel,
	toSpeciesModel,
} from '../schemas/species.schema.ts';
import { TypeApiSchema } from '../schemas/type.schema.ts';
import { flattenEvolution } from '../utils/evolution.utils.ts';
import { idFromUrl, slugFromUrl } from '../utils/format.utils.ts';

const REQUEST_TIMEOUT_MS = 15_000;
const TRANSLATION_KEY = 'tr';

/**
 * PokeAPI client. Every read goes through the cache first (read-through), then
 * the network; responses are validated with Zod and normalized/trimmed before
 * being cached. Injected with its config + cache (never hardcodes URLs).
 */
export class PokeApiService {
	artwork(id: number): string {
		return `${this._config.artworkUrl}/${id}.png`;
	}

	/** Wipes the persisted cache (used by the "clear cache" action). */
	clearCache(): Promise<void> {
		return this._cache.clear();
	}

	/** Approximate persisted size in bytes (for the footer indicator). */
	estimateCacheBytes(): Promise<number | null> {
		return this._cache.estimateBytes();
	}

	async getAll(): Promise<PokemonListItem[]> {
		const cached = await this._cache.get<PokemonListItem[]>('all');

		if (cached?.length) return cached;

		const raw = await this._fetch(
			`${this._config.apiUrl}/pokemon?limit=100000&offset=0`,
		);
		const { results } = PokemonListApiSchema.parse(raw);
		const list = results
			.map((entry) => ({ id: idFromUrl(entry.url), name: entry.name }))
			.filter((entry) => entry.id <= this._config.maxDex)
			.sort((a, b) => a.id - b.id);

		this._cache.set('all', list);

		return list;
	}

	async getEvolution(url: string): Promise<EvolutionModel> {
		const key = `evo:${idFromUrl(url)}`;
		const cached = await this._cache.get<EvolutionModel>(key);

		if (cached) return cached;

		const raw = await this._fetch(url);
		const { chain } = EvolutionApiSchema.parse(raw);
		const model: EvolutionModel = { stages: flattenEvolution(chain) };

		this._cache.set(key, model);

		return model;
	}

	async getPokemon(id: number): Promise<PokemonModel> {
		const key = `mon:${id}`;
		const cached = await this._cache.get<PokemonModel>(key);

		if (cached) return cached;

		const raw = await this._fetch(`${this._config.apiUrl}/pokemon/${id}`);
		const model = toPokemonModel(PokemonApiSchema.parse(raw));

		this._cache.set(key, model);

		return model;
	}

	async getSpecies(url: string): Promise<SpeciesModel> {
		const key = `sp:${idFromUrl(url)}`;
		const cached = await this._cache.get<SpeciesModel>(key);

		if (cached) return cached;

		const raw = await this._fetch(url);
		const model = toSpeciesModel(SpeciesApiSchema.parse(raw));

		this._cache.set(key, model);

		return model;
	}

	async getTypeIds(type: string): Promise<number[]> {
		const key = `type:${type}`;
		const cached = await this._cache.get<number[]>(key);

		if (cached) return cached;

		const raw = await this._fetch(`${this._config.apiUrl}/type/${type}`);
		const parsed = TypeApiSchema.parse(raw);
		const ids = parsed.pokemon
			.map((entry) => idFromUrl(entry.pokemon.url))
			.filter((id) => id <= this._config.maxDex);

		this._cache.set(key, ids);

		return ids;
	}

	/**
	 * Builds (and caches) an `id → types[]` index from the 18 type endpoints in a
	 * single pass, so the grid can render type badges/tints without fetching each
	 * Pokémon. Also primes the per-type id caches used by the type filter.
	 */
	async getTypeIndex(): Promise<Record<number, string[]>> {
		const cached =
			await this._cache.get<Record<number, string[]>>('typeindex');

		if (cached) return cached;

		const index: Record<number, string[]> = {};

		await Promise.all(
			TYPE_ORDER.map(async (type) => {
				const raw = await this._fetch(
					`${this._config.apiUrl}/type/${type}`,
				);
				const parsed = TypeApiSchema.parse(raw);
				const ids: number[] = [];

				for (const entry of parsed.pokemon) {
					const id = idFromUrl(entry.pokemon.url);

					if (id > this._config.maxDex) continue;

					(index[id] ??= [])[entry.slot - 1] = type;
					ids.push(id);
				}

				this._cache.set(`type:${type}`, ids);
			}),
		);

		for (const id of Object.keys(index)) {
			index[Number(id)] = index[Number(id)].filter(Boolean);
		}

		this._cache.set('typeindex', index);

		return index;
	}

	shinyArtwork(id: number): string {
		return `${this._config.artworkUrl}/shiny/${id}.png`;
	}

	sprite(id: number): string {
		return `${this._config.spriteUrl}/${id}.png`;
	}

	/** Translates ability/move urls to Spanish, caching a slug→name dictionary. */
	async translate(urls: string[]): Promise<string[]> {
		const dict =
			(await this._cache.get<Record<string, string>>(TRANSLATION_KEY)) ??
			{};
		let changed = false;

		const result = await Promise.all(
			urls.map(async (url) => {
				const slug = slugFromUrl(url);

				if (dict[slug] !== undefined) return dict[slug];

				try {
					const raw = await this._fetch(url);
					const { names } = LocalizedResourceSchema.parse(raw);
					const name =
						(
							names.find(
								(entry) => entry.language.name === 'es',
							) ??
							names.find((entry) => entry.language.name === 'en')
						)?.name ?? '';

					if (name) {
						dict[slug] = name;
						changed = true;
					}

					return name;
				} catch {
					return '';
				}
			}),
		);

		if (changed) this._cache.set(TRANSLATION_KEY, dict);

		return result;
	}

	private async _fetch(url: string): Promise<unknown> {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const response = await fetch(url, { signal: controller.signal });

			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			return await response.json();
		} finally {
			clearTimeout(timer);
		}
	}

	constructor(
		private readonly _config: AppConfig,
		private readonly _cache: KvCache,
	) {}
}
