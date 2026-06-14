import {
	RADAR_PALETTE,
	STAT_ORDER,
} from '../../constants/pokedex.constants.ts';
import { humanize } from '../../utils/format.utils.ts';
import styles from './RadarChart.module.css';

const LABELS = ['PS', 'Ataque', 'Defensa', 'At. Esp.', 'Def. Esp.', 'Vel.'];
const CENTER_X = 150;
const CENTER_Y = 140;
const RADIUS = 98;
const RINGS = 4;

/**
 * Hexagonal radar overlaying the base stats of up to three Pokémon.
 *
 * @returns radar chart
 */
export const RadarChart = ({
	entries,
}: RadarChartProps): React.ReactElement => {
	const valueOf = (entry: RadarEntry, key: string): number =>
		entry.stats.find((stat) => stat.key === key)?.value ?? 0;

	const allValues = entries.flatMap((entry) =>
		STAT_ORDER.map((key) => valueOf(entry, key)),
	);
	const maxValue = Math.max(
		80,
		Math.ceil(Math.max(...allValues, 0) / 20) * 20,
	);

	const point = (index: number, radius: number): [number, number] => {
		const angle = ((-90 + index * 60) * Math.PI) / 180;

		return [
			CENTER_X + radius * Math.cos(angle),
			CENTER_Y + radius * Math.sin(angle),
		];
	};

	const toPoints = (radius: (index: number) => number): string =>
		STAT_ORDER.map((_, index) =>
			point(index, radius(index))
				.map((value) => value.toFixed(1))
				.join(','),
		).join(' ');

	return (
		<div>
			<svg
				aria-label='Gráfico radar de estadísticas'
				className={styles.radar}
				role='img'
				viewBox='0 0 300 280'
			>
				{Array.from({ length: RINGS }, (_, ring) => {
					const radius = (RADIUS * (ring + 1)) / RINGS;

					return (
						<polygon
							fill='currentColor'
							fillOpacity={ring === RINGS - 1 ? 0.05 : 0}
							key={`ring-${ring}`}
							points={toPoints(() => radius)}
							stroke='currentColor'
							strokeOpacity={0.25}
							strokeWidth={1}
						/>
					);
				})}

				{STAT_ORDER.map((key, index) => {
					const [x, y] = point(index, RADIUS);

					return (
						<line
							key={`axis-${key}`}
							stroke='currentColor'
							strokeOpacity={0.25}
							strokeWidth={1}
							x1={CENTER_X}
							x2={x.toFixed(1)}
							y1={CENTER_Y}
							y2={y.toFixed(1)}
						/>
					);
				})}

				{entries.map((entry, entryIndex) => {
					const color =
						RADAR_PALETTE[entryIndex % RADAR_PALETTE.length];

					return (
						<polygon
							fill={color}
							fillOpacity={0.32}
							key={`poly-${entry.name}`}
							points={toPoints(
								(index) =>
									(RADIUS *
										valueOf(entry, STAT_ORDER[index])) /
									maxValue,
							)}
							stroke={color}
							strokeLinejoin='round'
							strokeWidth={2.5}
						/>
					);
				})}

				{entries.flatMap((entry, entryIndex) => {
					const color =
						RADAR_PALETTE[entryIndex % RADAR_PALETTE.length];

					return STAT_ORDER.map((key, index) => {
						const [x, y] = point(
							index,
							(RADIUS * valueOf(entry, key)) / maxValue,
						);

						return (
							<circle
								cx={x.toFixed(1)}
								cy={y.toFixed(1)}
								fill={color}
								key={`dot-${entry.name}-${key}`}
								r={3.2}
								stroke='#fff'
								strokeWidth={1}
							/>
						);
					});
				})}

				{STAT_ORDER.map((key, index) => {
					const [x, y] = point(index, RADIUS + 18);
					const anchor =
						Math.abs(x - CENTER_X) < 6
							? 'middle'
							: x > CENTER_X
								? 'start'
								: 'end';

					return (
						<text
							fill='currentColor'
							fillOpacity={0.72}
							fontSize={11}
							fontWeight={700}
							key={`label-${key}`}
							textAnchor={anchor}
							x={x.toFixed(1)}
							y={(y + 4).toFixed(1)}
						>
							{LABELS[index]}
						</text>
					);
				})}
			</svg>

			<div className={styles.legend}>
				{entries.map((entry, entryIndex) => (
					<span className={styles.item} key={entry.name}>
						<span
							className={styles.dot}
							style={{
								background:
									RADAR_PALETTE[
										entryIndex % RADAR_PALETTE.length
									],
							}}
						/>
						{humanize(entry.name)}
					</span>
				))}
			</div>
		</div>
	);
};

export interface RadarEntry {
	name: string;
	stats: { key: string; value: number }[];
}

export interface RadarChartProps {
	entries: RadarEntry[];
}
