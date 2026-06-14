import { useEffect, useState } from 'react';
import { STAT_ES } from '../../constants/pokedex.constants.ts';
import styles from './StatBar.module.css';

const STAT_MAX = 200;

/**
 * Single base-stat row with an animated, value-colored fill bar.
 *
 * @returns stat bar
 */
export const StatBar = ({
	statKey,
	value,
}: StatBarProps): React.ReactElement => {
	const target = Math.min(100, (value / STAT_MAX) * 100);
	const hue = Math.round((value / STAT_MAX) * 120);
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const id = requestAnimationFrame(() => setWidth(target));

		return () => cancelAnimationFrame(id);
	}, [target]);

	return (
		<div className={styles.stat}>
			<span className={styles.label}>{STAT_ES[statKey] ?? statKey}</span>
			<span className={styles.value}>{value}</span>
			<span className={styles.track}>
				<span
					className={styles.fill}
					style={{
						background: `linear-gradient(90deg,hsl(${hue} 88% 47%),hsl(${hue + 18} 92% 55%))`,
						width: `${width}%`,
					}}
				/>
			</span>
		</div>
	);
};

export interface StatBarProps {
	statKey: string;
	value: number;
}
