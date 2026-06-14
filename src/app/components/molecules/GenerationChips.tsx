import { useAtom, useSetAtom } from 'jotai';
import { GENERATIONS } from '../../constants/pokedex.constants.ts';
import {
	activeTypeAtom,
	generationAtom,
	searchAtom,
	showFavoritesAtom,
} from '../../store/filters.atom.ts';
import styles from './GenerationChips.module.css';

/**
 * Horizontally scrollable generation selector. Choosing a generation clears the
 * active global filters (search/type/favorites).
 *
 * @returns generation chips
 */
export const GenerationChips = (): React.ReactElement => {
	const [generation, setGeneration] = useAtom(generationAtom);
	const setSearch = useSetAtom(searchAtom);
	const setType = useSetAtom(activeTypeAtom);
	const setShowFavorites = useSetAtom(showFavoritesAtom);

	const select = (value: number): void => {
		setGeneration(value);
		setSearch('');
		setType(null);
		setShowFavorites(false);
	};

	return (
		<nav aria-label='Generaciones' className={styles.gens}>
			{GENERATIONS.map((generationItem) => (
				<button
					className={[
						styles.chip,
						generationItem.n === generation && styles.active,
					]
						.filter(Boolean)
						.join(' ')}
					key={generationItem.n}
					onClick={() => select(generationItem.n)}
					type='button'
				>
					<b>{generationItem.roman}</b>
					<span>{generationItem.region}</span>
				</button>
			))}
		</nav>
	);
};
