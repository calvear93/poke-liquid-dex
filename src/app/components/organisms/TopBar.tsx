import { useAtom } from 'jotai';
import { useTheme } from '../../hooks/use-theme.hook.ts';
import { showFavoritesAtom } from '../../store/filters.atom.ts';
import { IconButton } from '../atoms/IconButton.tsx';
import { GenerationChips } from '../molecules/GenerationChips.tsx';
import { SearchField } from '../molecules/SearchField.tsx';
import { TypeFilter } from '../molecules/TypeFilter.tsx';
import styles from './TopBar.module.css';

const THEME_ICON = { auto: '◐', dark: '☾', light: '☀' } as const;

/**
 * Sticky top bar: brand, favorites + theme toggles, search, and the generation
 * and type filters.
 *
 * @returns top bar
 */
export const TopBar = (): React.ReactElement => {
	const [showFavorites, setShowFavorites] = useAtom(showFavoritesAtom);
	const { cycle, theme } = useTheme();

	return (
		<header className={styles.topbar}>
			<div className={styles.row}>
				<div className={styles.brand}>
					<div aria-hidden='true' className={styles.logo} />
					<div className={styles.brandText}>
						<h1>Poke Liquid Dex</h1>
						<span>Pokédex</span>
					</div>
				</div>
				<IconButton
					active={showFavorites}
					label='Ver favoritos'
					onClick={() => setShowFavorites((value) => !value)}
				>
					♥
				</IconButton>
				<IconButton label='Cambiar tema' onClick={cycle}>
					{THEME_ICON[theme]}
				</IconButton>
			</div>

			<div className={styles.row}>
				<SearchField />
			</div>

			<GenerationChips />
			<TypeFilter />
		</header>
	);
};
