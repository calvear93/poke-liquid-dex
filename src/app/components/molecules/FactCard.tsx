import styles from './FactCard.module.css';

/**
 * Small labeled fact tile (e.g. height / weight).
 *
 * @returns fact card
 */
export const FactCard = ({
	label,
	value,
}: FactCardProps): React.ReactElement => (
	<div className={styles.fact}>
		<div className={styles.key}>{label}</div>
		<div className={styles.value}>{value}</div>
	</div>
);

export interface FactCardProps {
	label: string;
	value: string;
}
