/**
 * Dependency-free replacement for `jotai/utils`' `atomFamily` (deprecated in
 * Jotai v2, removed in v3). Memoizes one atom per primitive `param`.
 *
 * @param initialize - creates the atom for a given param
 * @returns a getter that returns the (cached) atom for each param
 */
export const atomFamily = <Param, AtomType>(
	initialize: (param: Param) => AtomType,
): ((param: Param) => AtomType) => {
	const cache = new Map<Param, AtomType>();

	return (param: Param): AtomType => {
		const existing = cache.get(param);

		if (existing !== undefined) return existing;

		const created = initialize(param);
		cache.set(param, created);

		return created;
	};
};
