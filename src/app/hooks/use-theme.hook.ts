import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { themeAtom, type ThemePreference } from '../store/theme.atom.ts';

const ORDER: ThemePreference[] = ['auto', 'light', 'dark'];

/**
 * Reads the persisted theme, reflects it on `<html data-theme>`, and exposes a
 * cycler (auto → light → dark).
 */
export const useTheme = (): { theme: ThemePreference; cycle: () => void } => {
	const [theme, setTheme] = useAtom(themeAtom);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
	}, [theme]);

	const cycle = (): void => {
		setTheme(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]);
	};

	return { cycle, theme };
};
