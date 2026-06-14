import { act, renderHook, type RenderOptions } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { FeatureHandler } from '../feature.handler.ts';
import { FeatureContextException } from './exceptions/feature-context.exception.ts';
import { useFeature, useFeatureHandler } from './feature.hook.ts';
import { FeatureProvider } from './Feature.provider.tsx';

describe('feature hooks', () => {
	const _handler = new FeatureHandler();
	const wrapper: RenderOptions['wrapper'] = ({ children }) => (
		<FeatureProvider handler={_handler}>{children}</FeatureProvider>
	);

	// hooks
	beforeAll(() => {
		vi.spyOn(console, 'error').mockImplementation(() => null);
	});

	afterAll(() => {
		vi.clearAllMocks();
	});

	// tests
	describe('useFeatureHandler', () => {
		test('when no FeatureProvider found, throws FeatureContextException', () => {
			const test = () => renderHook(useFeatureHandler);

			expect(test).toThrow(FeatureContextException);
		});

		test('returns FeatureHandler', () => {
			const { result } = renderHook(useFeatureHandler, { wrapper });

			expect(result.current).toBe(_handler);
		});
	});

	describe('useFeature', () => {
		test('returns feature value', () => {
			const feature = 'FEATURE';
			const { result } = renderHook(() => useFeature(feature), {
				wrapper,
			});

			// using FeatureHandler
			act(() => _handler.set(feature, true));
			const [value, setValue] = result.current;

			// using set fn
			act(() => setValue(false));
			const [newValue] = result.current;

			expect(value).toBe(true);
			expect(newValue).toBe(false);
		});

		test('does not update value when an unrelated feature changes', () => {
			const feature = 'WATCHED_FEATURE';
			const { result } = renderHook(() => useFeature(feature), {
				wrapper,
			});

			const [initialValue] = result.current;
			act(() => _handler.set('OTHER_FEATURE', true));
			const [valueAfterUnrelatedChange] = result.current;

			expect(initialValue).toBe(false);
			expect(valueAfterUnrelatedChange).toBe(false);
		});

		test('re-syncs value when the feature key changes', () => {
			const handler = new FeatureHandler({
				FEATURE_OFF: false,
				FEATURE_ON: true,
			});
			const wrapper: RenderOptions['wrapper'] = ({ children }) => (
				<FeatureProvider handler={handler}>{children}</FeatureProvider>
			);

			const { rerender, result } = renderHook(
				({ name }) => useFeature(name),
				{ initialProps: { name: 'FEATURE_ON' }, wrapper },
			);

			expect(result.current[0]).toBe(true);

			rerender({ name: 'FEATURE_OFF' });

			expect(result.current[0]).toBe(false);
		});

		test('unsubscribes listener on unmount', () => {
			const removeSpy = vi.spyOn(_handler, 'removeOnChangeListener');
			const { unmount } = renderHook(
				() => useFeature('UNMOUNT_FEATURE'),
				{
					wrapper,
				},
			);

			unmount();

			expect(removeSpy).toHaveBeenCalledTimes(1);
		});
	});
});
