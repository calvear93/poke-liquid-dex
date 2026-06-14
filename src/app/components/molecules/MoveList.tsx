import styles from './MoveList.module.css';

/**
 * Read-only pills listing a sample of the Pokémon's moves (Spanish names).
 *
 * @returns move list
 */
export const MoveList = ({ names }: MoveListProps): React.ReactElement => (
	<div className={styles.pills}>
		{names.map((name, index) => (
			<span className={styles.move} key={`${name}-${index}`}>
				{name}
			</span>
		))}
	</div>
);

export interface MoveListProps {
	names: string[];
}
