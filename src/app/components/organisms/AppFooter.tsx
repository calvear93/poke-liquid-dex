import { useEffect, useState } from 'react';
import { useInjection } from '../../app.ioc.ts';
import { PokeApiService } from '../../services/pokeapi.service.ts';
import styles from './AppFooter.module.css';

/**
 * Footer with credits, an approximate cache-size indicator and a button to
 * clear the persisted cache (preferences are preserved).
 *
 * @returns footer
 */
export const AppFooter = (): React.ReactElement => {
	const service = useInjection(PokeApiService);
	const [size, setSize] = useState<string | null>(null);
	const [clearing, setClearing] = useState(false);

	useEffect(() => {
		void (async () => {
			try {
				const bytes = await service.estimateCacheBytes();

				if (bytes !== null)
					setSize(`${(bytes / 1_048_576).toFixed(1)} MB`);
			} catch {
				// size indicator is optional
			}
		})();
	}, [service]);

	const clear = async (): Promise<void> => {
		setClearing(true);
		await service.clearCache();
		globalThis.location.reload();
	};

	return (
		<footer className={styles.footer}>
			<span>
				Datos:{' '}
				<a href='https://pokeapi.co' rel='noopener' target='_blank'>
					PokéAPI
				</a>{' '}
				· Liquid Glass
			</span>
			{size ? <span className={styles.size}>· Caché ~{size}</span> : null}
			<button
				className={styles.button}
				disabled={clearing}
				onClick={() => void clear()}
				title='Vaciar los datos guardados (conserva tus preferencias)'
				type='button'
			>
				{clearing ? 'Limpiando…' : '🗑 Limpiar caché'}
			</button>
		</footer>
	);
};
