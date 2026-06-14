import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/use-debounce.hook.ts';
import { searchAtom } from '../../store/filters.atom.ts';
import styles from './SearchField.module.css';

/**
 * Debounced search input bound to the global search atom.
 *
 * @returns search field
 */
export const SearchField = (): React.ReactElement => {
	const [search, setSearch] = useAtom(searchAtom);
	const [text, setText] = useState(search);
	const debounced = useDebounce(text, 140);

	useEffect(() => {
		setSearch(debounced.trim().toLowerCase());
	}, [debounced, setSearch]);

	// reflect external clears (e.g. choosing a generation)
	useEffect(() => {
		setText((previous) =>
			search === '' && previous !== '' ? '' : previous,
		);
	}, [search]);

	return (
		<div className={styles.search}>
			<svg
				aria-hidden='true'
				fill='none'
				stroke='currentColor'
				strokeLinecap='round'
				strokeWidth={2.2}
				viewBox='0 0 24 24'
			>
				<circle cx='11' cy='11' r='7' />
				<path d='m20 20-3.2-3.2' />
			</svg>
			<input
				aria-label='Buscar Pokémon'
				autoComplete='off'
				className={styles.input}
				inputMode='search'
				onChange={(event) => setText(event.target.value)}
				placeholder='Buscar por nombre o número…'
				type='search'
				value={text}
			/>
			{text ? (
				<button
					aria-label='Limpiar búsqueda'
					className={styles.clear}
					onClick={() => setText('')}
					type='button'
				>
					✕
				</button>
			) : null}
		</div>
	);
};
