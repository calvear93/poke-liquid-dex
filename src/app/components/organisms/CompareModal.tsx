import { useAtom, useAtomValue } from 'jotai';
import { Suspense, useEffect, useState } from 'react';
import { useInjection } from '../../app.ioc.ts';
import {
	STAT_ES,
	STAT_ORDER,
	TYPE_COLOR,
} from '../../constants/pokedex.constants.ts';
import { PokeApiService } from '../../services/pokeapi.service.ts';
import {
	compareModelsAtom,
	compareOpenAtom,
} from '../../store/compare.atom.ts';
import { capitalize, dexNumber, humanize } from '../../utils/format.utils.ts';
import { fallbackImage } from '../../utils/image.utils.ts';
import { PokeballLoader } from '../atoms/PokeballLoader.tsx';
import { RadarChart } from '../molecules/RadarChart.tsx';
import styles from './CompareModal.module.css';

const CompareContent = (): React.ReactElement => {
	const service = useInjection(PokeApiService);
	const models = useAtomValue(compareModelsAtom);
	const count = models.length;
	const columns = {
		gridTemplateColumns: `repeat(${count}, 1fr)`,
	} as React.CSSProperties;

	const totals = models.map((model) =>
		model.stats.reduce((sum, stat) => sum + stat.value, 0),
	);
	const bestTotal = Math.max(...totals);

	return (
		<div className={styles.body}>
			<div className={styles.heroHead}>
				<h1 className={styles.title}>Comparar</h1>
				<div className={styles.sub}>Estadísticas base lado a lado</div>
			</div>

			<RadarChart
				entries={models.map((model) => ({
					name: model.name,
					stats: model.stats,
				}))}
			/>

			<div className={styles.cols} style={columns}>
				{models.map((model) => (
					<div className={styles.head} key={model.id}>
						<div
							className={styles.pic}
							style={{
								boxShadow: `inset 0 0 0 2px ${TYPE_COLOR[model.types[0]] ?? '#888'}, inset 0 1px 0 var(--glass-hi)`,
							}}
						>
							<img
								alt={capitalize(model.name)}
								onError={(event) =>
									fallbackImage(
										event,
										service.sprite(model.id),
									)
								}
								src={service.artwork(model.id)}
							/>
						</div>
						<div className={styles.name}>
							{humanize(model.name)}
							<small>{dexNumber(model.id)}</small>
						</div>
					</div>
				))}
			</div>

			<div>
				{STAT_ORDER.map((key) => {
					const values = models.map(
						(model) =>
							model.stats.find((stat) => stat.key === key)
								?.value ?? 0,
					);
					const best = Math.max(...values);

					return (
						<div className={styles.row} key={key}>
							<div className={styles.rowLabel}>
								{STAT_ES[key]}
							</div>
							<div className={styles.cells} style={columns}>
								{models.map((model, index) => {
									const value = values[index];
									const ratio = Math.min(1, value / 200);
									const hue = Math.round(ratio * 120);

									return (
										<div
											className={[
												styles.cell,
												value === best &&
													count > 1 &&
													styles.best,
											]
												.filter(Boolean)
												.join(' ')}
											key={model.id}
										>
											<span className={styles.track}>
												<span
													className={styles.fill}
													style={{
														background: `linear-gradient(90deg,hsl(${hue} 88% 47%),hsl(${hue + 18} 92% 55%))`,
														width: `${ratio * 100}%`,
													}}
												/>
											</span>
											<span className={styles.value}>
												{value}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}

				<div className={[styles.row, styles.total].join(' ')}>
					<div className={styles.rowLabel}>Total</div>
					<div className={styles.cells} style={columns}>
						{models.map((model, index) => (
							<div
								className={[
									styles.cell,
									totals[index] === bestTotal &&
										count > 1 &&
										styles.best,
								]
									.filter(Boolean)
									.join(' ')}
								key={model.id}
							>
								<span className={styles.value}>
									{totals[index]}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * Side-by-side comparison modal (radar + per-stat table with best highlight).
 *
 * @returns compare modal or null when closed
 */
export const CompareModal = (): React.ReactElement | null => {
	const [open, setOpen] = useAtom(compareOpenAtom);
	const [shown, setShown] = useState(false);

	useEffect(() => {
		if (!open) return;

		const frame = requestAnimationFrame(() => setShown(true));
		document.body.style.overflow = 'hidden';

		const onKey = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') setOpen(false);
		};

		window.addEventListener('keydown', onKey);

		return () => {
			cancelAnimationFrame(frame);
			setShown(false);
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [open, setOpen]);

	if (!open) return null;

	return (
		<div
			className={[styles.modal, shown && styles.open]
				.filter(Boolean)
				.join(' ')}
		>
			<button
				aria-label='Cerrar comparación'
				className={styles.backdrop}
				onClick={() => setOpen(false)}
				type='button'
			/>
			<div
				aria-label='Comparación de estadísticas'
				aria-modal='true'
				className={styles.sheet}
				role='dialog'
			>
				<button
					aria-label='Cerrar comparación'
					className={styles.close}
					onClick={() => setOpen(false)}
					type='button'
				>
					✕
				</button>
				<div className={styles.scroll}>
					<Suspense
						fallback={
							<PokeballLoader label='Cargando comparación…' />
						}
					>
						<CompareContent />
					</Suspense>
				</div>
			</div>
		</div>
	);
};
