import styles from './FavoriteHeart.module.css';

/**
 * Heart toggle button for favorites.
 *
 * @returns favorite button
 */
export const FavoriteHeart = ({
	active,
	className,
	onToggle,
}: FavoriteHeartProps): React.ReactElement => (
	<button
		aria-label={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
		aria-pressed={active}
		className={[styles.fav, active && styles.on, className]
			.filter(Boolean)
			.join(' ')}
		onClick={(event) => {
			event.stopPropagation();
			onToggle();
		}}
		type='button'
	>
		{active ? '♥' : '♡'}
	</button>
);

export interface FavoriteHeartProps {
	active: boolean;
	className?: string;
	onToggle: () => void;
}
