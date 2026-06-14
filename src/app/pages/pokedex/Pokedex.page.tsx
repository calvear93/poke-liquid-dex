import { Suspense } from 'react';
import { PokeballLoader } from '../../components/atoms/PokeballLoader.tsx';
import { PokemonGrid } from '../../components/organisms/PokemonGrid.tsx';

/**
 * Main page: the searchable Pokémon gallery.
 *
 * @returns pokédex page
 */
export const PokedexPage = (): React.ReactElement => (
	<section>
		<title>Pokédex · Liquid Glass</title>
		<Suspense fallback={<PokeballLoader label='Cargando Pokédex…' />}>
			<PokemonGrid />
		</Suspense>
	</section>
);

export default PokedexPage;
