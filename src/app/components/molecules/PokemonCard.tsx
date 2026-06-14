import { useSetAtom } from 'jotai';
import { memo } from 'react';
import { useInjection } from '../../app.ioc.ts';
import { TYPE_COLOR } from '../../constants/pokedex.constants.ts';
import { PokeApiService } from '../../services/pokeapi.service.ts';
import { selectedDetailAtom } from '../../store/compare.atom.ts';
import { toggleFavoriteAtom } from '../../store/favorites.atom.ts';
import { capitalize, dexNumber, humanize } from '../../utils/format.utils.ts';
import { fallbackImage } from '../../utils/image.utils.ts';
import { FavoriteHeart } from '../atoms/FavoriteHeart.tsx';
import { TypeBadge } from '../atoms/TypeBadge.tsx';
import styles from './PokemonCard.module.css';

/**
 * Grid card: artwork, number, name and a favorite toggle. Types + tint come
 * from the precomputed type index (passed as a prop), so the card never fetches
 * per Pokémon and re-renders only when its own props change.
 *
 * @returns pokémon card
 */
const PokemonCardBase = ({
	id,
	index,
	isFavorite,
	name,
	types,
}: PokemonCardProps): React.ReactElement => {
	const service = useInjection(PokeApiService);
	const setSelected = useSetAtom(selectedDetailAtom);
	const toggleFavorite = useSetAtom(toggleFavoriteAtom);
	const tint = types?.length ? (TYPE_COLOR[types[0]] ?? '#777') : undefined;

	return (
		<div
			className={[styles.card, tint && styles.tinted]
				.filter(Boolean)
				.join(' ')}
			style={
				{
					'--i': Math.min(index, 30),
					'--tint': tint,
				} as React.CSSProperties
			}
		>
			<button
				aria-label={`${capitalize(name)}, ${dexNumber(id)}`}
				className={styles.open}
				onClick={() => setSelected(id)}
				type='button'
			/>
			<span className={styles.glow} />
			<FavoriteHeart
				active={isFavorite}
				className={styles.fav}
				onToggle={() => toggleFavorite(id)}
			/>
			<span className={styles.num}>{dexNumber(id)}</span>
			<span className={styles.image}>
				<img
					alt={capitalize(name)}
					decoding='async'
					loading='lazy'
					onError={(event) =>
						fallbackImage(event, service.sprite(id))
					}
					src={service.artwork(id)}
				/>
			</span>
			<span className={styles.name}>{humanize(name)}</span>
			<span className={styles.types}>
				{types?.map((type) => (
					<TypeBadge key={type} type={type} />
				))}
			</span>
		</div>
	);
};

export const PokemonCard = memo(PokemonCardBase);

export interface PokemonCardProps {
	id: number;
	index: number;
	isFavorite: boolean;
	name: string;
	types?: string[];
}
