/**
 * Swaps an `<img>` to a fallback source once (guards against error loops via a
 * data attribute instead of reassigning `onerror`).
 */
export const fallbackImage = (
	event: React.SyntheticEvent<HTMLImageElement>,
	fallbackSrc: string,
): void => {
	const img = event.currentTarget;

	if (img.dataset.fallback) return;

	img.dataset.fallback = '1';
	img.src = fallbackSrc;
};
