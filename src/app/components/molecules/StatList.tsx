import { STAT_ORDER } from '../../constants/pokedex.constants.ts';
import { StatBar } from '../atoms/StatBar.tsx';
import styles from './StatList.module.css';

const ORDER = STAT_ORDER as readonly string[];

/**
 * Ordered list of base stats with a total row.
 *
 * @returns stat list
 */
export const StatList = ({ stats }: StatListProps): React.ReactElement => {
	const total = stats.reduce((sum, stat) => sum + stat.value, 0);
	const ordered = [...stats].sort(
		(a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key),
	);

	return (
		<div>
			{ordered.map((stat) => (
				<StatBar key={stat.key} statKey={stat.key} value={stat.value} />
			))}
			<div className={styles.total}>
				<span className={styles.label}>Total</span>
				<b>{total}</b>
			</div>
		</div>
	);
};

export interface StatListProps {
	stats: { key: string; value: number }[];
}
