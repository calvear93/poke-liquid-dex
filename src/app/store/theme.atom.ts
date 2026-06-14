import { atomWithStorage } from 'jotai/utils';

export type ThemePreference = 'auto' | 'dark' | 'light';

/** Persisted theme preference; `auto` follows the OS color scheme. */
export const themeAtom = atomWithStorage<ThemePreference>(
	'pokedex:theme',
	'auto',
);
