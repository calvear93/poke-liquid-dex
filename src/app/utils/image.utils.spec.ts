import { describe, expect, test } from 'vitest';
import { fallbackImage } from './image.utils.ts';

const makeEvent = (
	dataset: Record<string, string> = {},
): React.SyntheticEvent<HTMLImageElement> => {
	const img = { dataset, src: 'original.png' } as unknown as HTMLImageElement;

	return { currentTarget: img } as React.SyntheticEvent<HTMLImageElement>;
};

describe('fallbackImage', () => {
	test('swaps to the fallback source once', () => {
		const event = makeEvent();

		fallbackImage(event, 'fallback.png');

		expect(event.currentTarget.src).toBe('fallback.png');
		expect(event.currentTarget.dataset.fallback).toBe('1');
	});

	test('does nothing once the fallback was already applied', () => {
		const event = makeEvent({ fallback: '1' });

		fallbackImage(event, 'fallback.png');

		expect(event.currentTarget.src).toBe('original.png');
	});
});
