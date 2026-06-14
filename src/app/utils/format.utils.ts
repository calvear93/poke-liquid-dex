/**
 * Small pure formatting helpers shared across the Pokédex UI.
 */

/** Capitalizes the first letter of a string. */
export const capitalize = (value: string): string =>
	value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

/** Replaces dashes with spaces (e.g. `special-attack` → `special attack`). */
export const humanize = (value: string): string => value.replaceAll('-', ' ');

/** Formats a national-dex number (e.g. `6` → `#006`). */
export const dexNumber = (id: number): string =>
	`#${String(id).padStart(3, '0')}`;

/** Extracts the trailing numeric id from a PokeAPI url. */
export const idFromUrl = (url: string): number =>
	Number(url.split('/').findLast(Boolean));

/** Extracts the trailing slug from a PokeAPI url (e.g. an ability/move name). */
export const slugFromUrl = (url: string): string =>
	url.split('/').findLast(Boolean) ?? '';

/** Formats decimetres as meters with a Spanish decimal comma (e.g. `17` → `1,7`). */
export const toMeters = (decimetres: number): string =>
	(decimetres / 10).toFixed(1).replace('.', ',');

/** Formats hectograms as kilograms with a Spanish decimal comma. */
export const toKilograms = (hectograms: number): string =>
	(hectograms / 10).toFixed(1).replace('.', ',');
