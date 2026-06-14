import { useLocation } from 'react-router';

/**
 * Returns URL hash value.
 *
 * @see useLocation from react-router.
 * @returns URL hash.
 *
 * @example
 *	const hash = useHash();
 */
export const useHashValue = (): string => {
	const { hash } = useLocation();

	return hash.slice(1);
};
