import { z } from 'zod';

/**
 * Application configuration, parsed and validated from `import.meta.env`.
 * This is the ONLY place that reads `APP_*` env vars; everything else consumes
 * the typed {@link appConfig} (bound in the IoC container).
 */
const AppConfigSchema = z.object({
	apiUrl: z.string().min(1),
	artworkUrl: z.string().min(1),
	cacheVersion: z.string().min(1),
	criesUrl: z.string().min(1),
	maxDex: z.coerce.number().int().positive(),
	spriteUrl: z.string().min(1),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export const appConfig: AppConfig = AppConfigSchema.parse({
	apiUrl: import.meta.env.APP_API_URL,
	artworkUrl: import.meta.env.APP_ARTWORK_URL,
	cacheVersion: import.meta.env.APP_CACHE_VERSION,
	criesUrl: import.meta.env.APP_CRIES_URL,
	maxDex: import.meta.env.APP_MAX_DEX,
	spriteUrl: import.meta.env.APP_SPRITE_URL,
});
