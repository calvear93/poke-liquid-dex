import { createKvCache } from '#libs/cache';
import { createContainer } from '#libs/ioc';
import { appConfig } from './app.config.ts';
import { PokeApiService } from './services/pokeapi.service.ts';

/**
 * Bootstrap layer: builds the persistent cache + PokeAPI service from the
 * validated config and registers them in the IoC container. Components resolve
 * them with `useInjection`; Jotai atoms read the same singleton via `serviceAtom`.
 */
const cache = createKvCache(`pokedex-${appConfig.cacheVersion}`);

export const pokeApiService = new PokeApiService(appConfig, cache);

export const { container, InversionOfControlProvider, useInjection } =
	createContainer();

container.bind(PokeApiService, pokeApiService);
container.bind('appConfig', appConfig);
