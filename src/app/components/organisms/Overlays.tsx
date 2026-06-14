import { useAtom, useAtomValue } from 'jotai';
import { lazy, Suspense } from 'react';
import {
	compareOpenAtom,
	selectedDetailAtom,
} from '../../store/compare.atom.ts';
import { CompareTray } from './CompareTray.tsx';

const DetailSheet = lazy(async () => ({
	default: (await import('./DetailSheet.tsx')).DetailSheet,
}));

const CompareModal = lazy(async () => ({
	default: (await import('./CompareModal.tsx')).CompareModal,
}));

/**
 * Global overlays: the comparison tray plus the lazily-loaded detail and
 * comparison modals, driven entirely by global state.
 *
 * @returns overlays
 */
export const Overlays = (): React.ReactElement => {
	const [selected, setSelected] = useAtom(selectedDetailAtom);
	const compareOpen = useAtomValue(compareOpenAtom);

	return (
		<>
			<CompareTray />
			{selected === null ? null : (
				<Suspense fallback={null}>
					<DetailSheet
						id={selected}
						key={selected}
						onClose={() => setSelected(null)}
					/>
				</Suspense>
			)}
			{compareOpen ? (
				<Suspense fallback={null}>
					<CompareModal />
				</Suspense>
			) : null}
		</>
	);
};
