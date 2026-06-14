import { TYPE_COLOR, TYPE_ES } from '../../constants/pokedex.constants.ts';
import { capitalize } from '../../utils/format.utils.ts';
import styles from './TypeBadge.module.css';

/**
 * Colored pill showing a Pokémon type (Spanish label).
 *
 * @returns type badge
 */
export const TypeBadge = ({ type }: TypeBadgeProps): React.ReactElement => (
	<span
		className={styles.type}
		style={{ '--c': TYPE_COLOR[type] ?? '#777' } as React.CSSProperties}
	>
		<span className={styles.dot} />
		{TYPE_ES[type] ?? capitalize(type)}
	</span>
);

export interface TypeBadgeProps {
	type: string;
}
