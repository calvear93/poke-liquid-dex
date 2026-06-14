import { useAtom } from 'jotai';
import {
	TYPE_COLOR,
	TYPE_ES,
	TYPE_ORDER,
} from '../../constants/pokedex.constants.ts';
import { activeTypeAtom } from '../../store/filters.atom.ts';
import styles from './TypeFilter.module.css';

/**
 * Type filter chips. Selecting a type filters across the whole dex; selecting
 * "Todos" (or the active type again) clears it.
 *
 * @returns type filter
 */
export const TypeFilter = (): React.ReactElement => {
	const [activeType, setActiveType] = useAtom(activeTypeAtom);

	return (
		<nav aria-label='Filtrar por tipo' className={styles.types}>
			<button
				className={[
					styles.chip,
					styles.all,
					!activeType && styles.active,
				]
					.filter(Boolean)
					.join(' ')}
				onClick={() => setActiveType(null)}
				type='button'
			>
				Todos
			</button>
			{TYPE_ORDER.map((type) => (
				<button
					className={[
						styles.chip,
						activeType === type && styles.active,
					]
						.filter(Boolean)
						.join(' ')}
					key={type}
					onClick={() =>
						setActiveType(activeType === type ? null : type)
					}
					style={{ '--c': TYPE_COLOR[type] } as React.CSSProperties}
					type='button'
				>
					<span className={styles.dot} />
					{TYPE_ES[type]}
				</button>
			))}
		</nav>
	);
};
