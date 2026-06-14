import { atom } from 'jotai';

export interface ___AtomName___State {
	anyValue: number;
}

const _inner___AtomName___Atom = atom<___AtomName___State>({
	anyValue: 1,
});

/**
 * ___AtomName___ atom for jotai store.
 *
 * @returns atom
 */
export const ___atomName___Atom = atom(
	(get) => get(_inner___AtomName___Atom),
	(get, set, val: number) => {
		set(_inner___AtomName___Atom, {
			anyValue: val,
		});
	},
);
