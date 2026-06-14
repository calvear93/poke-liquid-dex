import { useSetAtom } from 'jotai';
import { Fragment } from 'react';
import { useInjection } from '../../app.ioc.ts';
import { type EvolutionStage } from '../../schemas/evolution.schema.ts';
import { PokeApiService } from '../../services/pokeapi.service.ts';
import { selectedDetailAtom } from '../../store/compare.atom.ts';
import { capitalize, humanize } from '../../utils/format.utils.ts';
import { fallbackImage } from '../../utils/image.utils.ts';
import styles from './EvolutionChain.module.css';

/**
 * Navigable evolution chain thumbnails (tap a stage to open it).
 *
 * @returns evolution chain or null when there's a single stage
 */
export const EvolutionChain = ({
	currentId,
	stages,
}: EvolutionChainProps): React.ReactElement | null => {
	const service = useInjection(PokeApiService);
	const setSelected = useSetAtom(selectedDetailAtom);

	if (stages.length <= 1) return null;

	return (
		<div className={styles.evo}>
			{stages.map((stage, index) => (
				<Fragment key={stage.id}>
					{index > 0 ? <span className={styles.arrow}>→</span> : null}
					<button
						className={[
							styles.item,
							stage.id === currentId && styles.current,
						]
							.filter(Boolean)
							.join(' ')}
						onClick={() => setSelected(stage.id)}
						type='button'
					>
						<span className={styles.pic}>
							<img
								alt={capitalize(stage.name)}
								loading='lazy'
								onError={(event) =>
									fallbackImage(
										event,
										service.sprite(stage.id),
									)
								}
								src={service.artwork(stage.id)}
							/>
						</span>
						<span className={styles.name}>
							{humanize(stage.name)}
						</span>
					</button>
				</Fragment>
			))}
		</div>
	);
};

export interface EvolutionChainProps {
	currentId: number;
	stages: EvolutionStage[];
}
