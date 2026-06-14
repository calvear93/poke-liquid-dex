import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useInjection } from '../../app.ioc.ts';
import { PokeApiService } from '../../services/pokeapi.service.ts';
import {
	clearCompareAtom,
	compareAtom,
	compareOpenAtom,
	selectedDetailAtom,
	toggleCompareAtom,
} from '../../store/compare.atom.ts';
import { fallbackImage } from '../../utils/image.utils.ts';
import styles from './CompareTray.module.css';

/**
 * Floating tray with the Pokémon selected for comparison. Hidden while a modal
 * is open; offers per-item removal, "compare", and a clear-all action.
 *
 * @returns compare tray
 */
export const CompareTray = (): React.ReactElement => {
	const service = useInjection(PokeApiService);
	const compare = useAtomValue(compareAtom);
	const selected = useAtomValue(selectedDetailAtom);
	const [open, setOpen] = useAtom(compareOpenAtom);
	const setSelected = useSetAtom(selectedDetailAtom);
	const toggleCompare = useSetAtom(toggleCompareAtom);
	const clearCompare = useSetAtom(clearCompareAtom);

	const visible = compare.length > 0 && selected === null && !open;

	return (
		<div
			aria-live='polite'
			className={[styles.tray, visible && styles.show]
				.filter(Boolean)
				.join(' ')}
		>
			<div className={styles.avatars}>
				{compare.map((id) => (
					<span className={styles.avatar} key={id}>
						<button
							aria-label='Ver Pokémon'
							className={styles.avatarOpen}
							onClick={() => setSelected(id)}
							type='button'
						>
							<img
								alt=''
								onError={(event) =>
									fallbackImage(event, service.sprite(id))
								}
								src={service.artwork(id)}
							/>
						</button>
						<button
							aria-label='Quitar de la comparación'
							className={styles.remove}
							onClick={() => toggleCompare(id)}
							type='button'
						>
							✕
						</button>
					</span>
				))}
			</div>
			<button
				className={styles.go}
				disabled={compare.length < 2}
				onClick={() => setOpen(true)}
				type='button'
			>
				Comparar ({compare.length})
			</button>
			<button
				aria-label='Vaciar comparación'
				className={styles.clear}
				onClick={() => clearCompare()}
				type='button'
			>
				✕
			</button>
		</div>
	);
};
