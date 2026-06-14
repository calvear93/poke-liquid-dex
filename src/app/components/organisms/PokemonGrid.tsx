import { useAtomValue } from 'jotai';
import { GENERATIONS, TYPE_ES } from '../../constants/pokedex.constants.ts';
import { favoritesAtom } from '../../store/favorites.atom.ts';
import {
	activeTypeAtom,
	generationAtom,
	isFilteringAtom,
	searchAtom,
	showFavoritesAtom,
	visibleListAtom,
} from '../../store/filters.atom.ts';
import { typeIndexValueAtom } from '../../store/pokemon.atom.ts';
import { PokemonCard } from '../molecules/PokemonCard.tsx';
import styles from './PokemonGrid.module.css';

interface HeaderInput {
	activeType: string | null;
	filtering: boolean;
	generation: number;
	search: string;
	showFavorites: boolean;
}

const headerLabel = ({
	activeType,
	filtering,
	generation,
	search,
	showFavorites,
}: HeaderInput): string => {
	if (!filtering) {
		const range =
			GENERATIONS.find((item) => item.n === generation) ?? GENERATIONS[0];

		return `Generación ${range.roman} · ${range.region}`;
	}

	const parts: string[] = [];

	if (showFavorites) parts.push('Favoritos');
	if (activeType) parts.push(`Tipo ${TYPE_ES[activeType] ?? activeType}`);
	if (search) parts.push(`“${search}”`);

	return parts.join(' · ') || 'Resultados';
};

/**
 * Responsive grid of Pokémon cards for the current generation / filters.
 * Suspends while the (cached) dex list resolves.
 *
 * @returns grid
 */
export const PokemonGrid = (): React.ReactElement => {
	const list = useAtomValue(visibleListAtom);
	const typeIndex = useAtomValue(typeIndexValueAtom);
	const favorites = useAtomValue(favoritesAtom);
	const filtering = useAtomValue(isFilteringAtom);
	const search = useAtomValue(searchAtom);
	const activeType = useAtomValue(activeTypeAtom);
	const showFavorites = useAtomValue(showFavoritesAtom);
	const generation = useAtomValue(generationAtom);

	const favoriteSet = new Set(favorites);
	const title = headerLabel({
		activeType,
		filtering,
		generation,
		search,
		showFavorites,
	});

	return (
		<>
			<div className={styles.head}>
				<h2>{title}</h2>
				<span className={styles.count}>{list.length} Pokémon</span>
			</div>

			{list.length === 0 ? (
				<div className={styles.empty}>
					<span className={styles.emoji}>
						{showFavorites ? '💜' : '🔍'}
					</span>
					<b>Sin resultados</b>
					{showFavorites && favorites.length === 0
						? 'Aún no tienes favoritos. Toca el ♡ de una tarjeta para guardarlo.'
						: 'No encontramos ningún Pokémon con estos filtros.'}
				</div>
			) : (
				<div className={styles.grid}>
					{list.map((item, index) => (
						<PokemonCard
							id={item.id}
							index={index}
							isFavorite={favoriteSet.has(item.id)}
							key={item.id}
							name={item.name}
							types={typeIndex?.[item.id]}
						/>
					))}
				</div>
			)}
		</>
	);
};
