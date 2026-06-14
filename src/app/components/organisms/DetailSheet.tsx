import { useAtomValue, useSetAtom } from 'jotai';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useInjection } from '../../app.ioc.ts';
import { TYPE_COLOR } from '../../constants/pokedex.constants.ts';
import { useTranslations } from '../../hooks/use-translations.hook.ts';
import { PokeApiService } from '../../services/pokeapi.service.ts';
import { compareAtom, toggleCompareAtom } from '../../store/compare.atom.ts';
import {
	favoritesAtom,
	toggleFavoriteAtom,
} from '../../store/favorites.atom.ts';
import {
	evolutionAtom,
	pokemonAtom,
	speciesAtom,
} from '../../store/pokemon.atom.ts';
import {
	capitalize,
	dexNumber,
	humanize,
	idFromUrl,
	toKilograms,
	toMeters,
} from '../../utils/format.utils.ts';
import { fallbackImage } from '../../utils/image.utils.ts';
import { type ShareCardData } from '../../utils/share-card.utils.ts';
import { PokeballLoader } from '../atoms/PokeballLoader.tsx';
import { TypeBadge } from '../atoms/TypeBadge.tsx';
import { EvolutionChain } from '../molecules/EvolutionChain.tsx';
import { FactCard } from '../molecules/FactCard.tsx';
import { FormPills } from '../molecules/FormPills.tsx';
import { MoveList } from '../molecules/MoveList.tsx';
import { StatList } from '../molecules/StatList.tsx';
import styles from './DetailSheet.module.css';

const DRAG_THRESHOLD = 110;

/** Bottom-sheet drag-to-dismiss on small screens (handle / hero top only). */
const useSheetDrag = (
	sheetRef: React.RefObject<HTMLDivElement | null>,
	scrollRef: React.RefObject<HTMLDivElement | null>,
	onClose: () => void,
): void => {
	useEffect(() => {
		const sheet = sheetRef.current;

		if (!sheet) return;

		const isMobile = (): boolean =>
			window.matchMedia('(max-width: 680px)').matches;

		let dragging = false;
		let startY = 0;
		let delta = 0;

		const onDown = (event: PointerEvent): void => {
			if (!isMobile()) return;

			const target = event.target as HTMLElement;

			if (target.closest('button')) return;

			const fromHandle = Boolean(target.closest(`.${styles.handle}`));
			const atTop = (scrollRef.current?.scrollTop ?? 0) <= 0;

			if (!fromHandle && !atTop) return;

			dragging = true;
			startY = event.clientY;
			delta = 0;
			sheet.style.transition = 'none';
		};

		const onMove = (event: PointerEvent): void => {
			if (!dragging) return;

			delta = Math.max(0, event.clientY - startY);

			if (delta > 0) {
				sheet.style.transform = `translateY(${delta}px)`;

				if (event.cancelable) event.preventDefault();
			}
		};

		const onUp = (): void => {
			if (!dragging) return;

			dragging = false;
			sheet.style.transition = '';

			if (delta > DRAG_THRESHOLD) onClose();
			else sheet.style.transform = '';
		};

		sheet.addEventListener('pointerdown', onDown);
		window.addEventListener('pointermove', onMove, { passive: false });
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);

		return () => {
			sheet.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
		};
	}, [sheetRef, scrollRef, onClose]);
};

const EvolutionSection = ({
	currentId,
	url,
}: {
	currentId: number;
	url: string;
}): React.ReactElement | null => {
	const evolution = useAtomValue(evolutionAtom(url));

	if (evolution.stages.length <= 1) return null;

	return (
		<section className={styles.section}>
			<h3>Evolución</h3>
			<EvolutionChain currentId={currentId} stages={evolution.stages} />
		</section>
	);
};

const DetailContent = ({ id }: { id: number }): React.ReactElement => {
	const service = useInjection(PokeApiService);
	const [displayId, setDisplayId] = useState(id);
	const [shiny, setShiny] = useState(false);
	const [sharing, setSharing] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const pokemon = useAtomValue(pokemonAtom(displayId));
	const species = useAtomValue(speciesAtom(pokemon.speciesUrl));

	const favorites = useAtomValue(favoritesAtom);
	const compare = useAtomValue(compareAtom);
	const toggleFavorite = useSetAtom(toggleFavoriteAtom);
	const toggleCompare = useSetAtom(toggleCompareAtom);

	const abilityNames = useTranslations(
		pokemon.abilities.map((ability) => ability.url),
	);
	const moveNames = useTranslations(pokemon.moves.map((move) => move.url));

	const tint = TYPE_COLOR[pokemon.types[0]] ?? '#777';
	const isFavorite = favorites.includes(id);
	const inCompare = compare.includes(id);
	const defaultUrl =
		species.varieties.find((variety) => variety.isDefault)?.url ?? '';
	const activeUrl =
		species.varieties.find(
			(variety) => idFromUrl(variety.url) === displayId,
		)?.url ?? defaultUrl;

	const playCry = (): void => {
		if (!pokemon.cry) return;

		audioRef.current?.pause();
		const audio = new Audio(pokemon.cry);
		audio.volume = 0.4;
		audioRef.current = audio;

		void (async () => {
			try {
				await audio.play();
			} catch {
				// autoplay may be blocked by the browser
			}
		})();
	};

	const share = async (): Promise<void> => {
		setSharing(true);

		try {
			const { shareCard } =
				await import('../../utils/share-card.utils.ts');
			const data: ShareCardData = {
				id: displayId,
				fallbackUrl: service.sprite(displayId),
				imageUrl: service.artwork(displayId),
				name: species.displayName,
				num: dexNumber(displayId),
				stats: pokemon.stats,
				tint,
				types: pokemon.types,
			};

			await shareCard(data);
		} finally {
			setSharing(false);
		}
	};

	const artwork = shiny
		? service.shinyArtwork(displayId)
		: service.artwork(displayId);

	return (
		<div
			className={styles.content}
			style={{ '--tint': tint } as React.CSSProperties}
		>
			<div className={styles.left}>
				<div className={styles.hero}>
					<span className={styles.num}>{dexNumber(displayId)}</span>
					<h1 className={styles.name}>{species.displayName}</h1>
					<div className={styles.genus}>{species.genus}</div>
					<div className={styles.types}>
						{pokemon.types.map((type) => (
							<TypeBadge key={type} type={type} />
						))}
					</div>
					<div className={styles.actions}>
						<button
							className={[styles.act, isFavorite && styles.actFav]
								.filter(Boolean)
								.join(' ')}
							onClick={() => toggleFavorite(id)}
							type='button'
						>
							{isFavorite ? '♥' : '♡'} Favorito
						</button>
						<button
							className={[
								styles.act,
								inCompare && styles.actCompare,
							]
								.filter(Boolean)
								.join(' ')}
							onClick={() => toggleCompare(id)}
							type='button'
						>
							{inCompare ? '✓' : '⚖'} Comparar
						</button>
						<button
							className={styles.act}
							disabled={sharing}
							onClick={() => void share()}
							type='button'
						>
							{sharing ? '⏳ Generando…' : '📤 Compartir'}
						</button>
					</div>
				</div>

				<div className={styles.art}>
					<button
						aria-label='Escuchar grito'
						className={styles.cry}
						onClick={playCry}
						type='button'
					>
						🔊
					</button>
					<button
						aria-label='Alternar shiny'
						aria-pressed={shiny}
						className={[styles.shiny, shiny && styles.shinyOn]
							.filter(Boolean)
							.join(' ')}
						onClick={() => setShiny((value) => !value)}
						type='button'
					>
						✨
					</button>
					<img
						alt={capitalize(species.displayName)}
						onError={(event) =>
							fallbackImage(event, service.sprite(displayId))
						}
						src={artwork}
					/>
				</div>
			</div>

			<div className={styles.right}>
				<div className={styles.body}>
					<section className={styles.section}>
						<h3>Descripción</h3>
						<p className={styles.about}>{species.flavor}</p>
					</section>

					<div className={styles.facts}>
						<FactCard
							label='Altura'
							value={`${toMeters(pokemon.height)} m`}
						/>
						<FactCard
							label='Peso'
							value={`${toKilograms(pokemon.weight)} kg`}
						/>
					</div>

					<section className={styles.section}>
						<h3>Habilidades</h3>
						<div className={styles.abilities}>
							{pokemon.abilities.map((ability, index) => (
								<span
									className={[
										styles.ability,
										ability.hidden && styles.hidden,
									]
										.filter(Boolean)
										.join(' ')}
									key={ability.slug}
								>
									{abilityNames[index] ||
										humanize(ability.slug)}
									{ability.hidden ? (
										<em className={styles.hiddenTag}>
											{' '}
											· oculta
										</em>
									) : null}
								</span>
							))}
						</div>
					</section>

					<section className={styles.section}>
						<h3>Estadísticas base</h3>
						<StatList stats={pokemon.stats} />
					</section>

					{species.evolutionUrl ? (
						<Suspense fallback={null}>
							<EvolutionSection
								currentId={displayId}
								url={species.evolutionUrl}
							/>
						</Suspense>
					) : null}

					{species.varieties.length > 1 ? (
						<section className={styles.section}>
							<h3>Formas</h3>
							<FormPills
								activeUrl={activeUrl}
								items={species.varieties.map((variety) => ({
									url: variety.url,
									label: variety.isDefault
										? 'Predeterminada'
										: humanize(variety.slug),
								}))}
								onSelect={(url) => {
									setShiny(false);
									setDisplayId(idFromUrl(url));
								}}
							/>
						</section>
					) : null}

					{pokemon.movesTotal > 0 ? (
						<section className={styles.section}>
							<h3>Movimientos · {pokemon.movesTotal} en total</h3>
							<MoveList
								names={pokemon.moves.map(
									(move, index) =>
										moveNames[index] || humanize(move.slug),
								)}
							/>
						</section>
					) : null}
				</div>
			</div>
		</div>
	);
};

/**
 * Detail modal / bottom-sheet for a Pokémon. The frame appears immediately and
 * the content suspends (skeleton) while the cached data resolves.
 *
 * @returns detail sheet
 */
export const DetailSheet = ({
	id,
	onClose,
}: DetailSheetProps): React.ReactElement => {
	const [open, setOpen] = useState(false);
	const sheetRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setOpen(true));
		document.body.style.overflow = 'hidden';

		const onKey = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') onClose();
		};

		window.addEventListener('keydown', onKey);

		return () => {
			cancelAnimationFrame(frame);
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [onClose]);

	useSheetDrag(sheetRef, scrollRef, onClose);

	return (
		<div
			className={[styles.modal, open && styles.open]
				.filter(Boolean)
				.join(' ')}
		>
			<button
				aria-label='Cerrar detalle'
				className={styles.backdrop}
				onClick={onClose}
				type='button'
			/>
			<div
				aria-label='Detalle de Pokémon'
				aria-modal='true'
				className={styles.sheet}
				ref={sheetRef}
				role='dialog'
			>
				<div className={styles.handle} />
				<button
					aria-label='Cerrar detalle'
					className={styles.close}
					onClick={onClose}
					type='button'
				>
					✕
				</button>
				<div className={styles.scroll} ref={scrollRef}>
					<Suspense
						fallback={<PokeballLoader label='Cargando ficha…' />}
					>
						<DetailContent id={id} />
					</Suspense>
				</div>
			</div>
		</div>
	);
};

export interface DetailSheetProps {
	id: number;
	onClose: () => void;
}
