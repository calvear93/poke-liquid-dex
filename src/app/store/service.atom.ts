import { atom } from 'jotai';
import { pokeApiService } from '../app.ioc.ts';
import { type PokeApiService } from '../services/pokeapi.service.ts';

/**
 * Bridges the IoC-provided {@link PokeApiService} to Jotai atoms (which cannot
 * use the `useInjection` hook). Defaults to the real singleton; tests override
 * it via a Jotai `Provider` with `initialValues`.
 */
export const serviceAtom = atom<PokeApiService>(pokeApiService);
