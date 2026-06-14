import styles from './PokeballLoader.module.css';

/**
 * Spinning pokéball used as a loading indicator / Suspense fallback.
 *
 * @returns loader
 */
export const PokeballLoader = ({
	label = 'Cargando…',
}: PokeballLoaderProps): React.ReactElement => (
	<div aria-live='polite' className={styles.loader} role='status'>
		<div className={styles.ball} />
		<p>{label}</p>
	</div>
);

export interface PokeballLoaderProps {
	label?: string;
}
