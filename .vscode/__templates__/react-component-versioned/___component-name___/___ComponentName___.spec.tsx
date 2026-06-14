import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { FeatureHandler, FeatureProvider } from '#libs/feature';
import { ___ComponentName___ } from './___ComponentName___.tsx';

describe(___ComponentName___, () => {
	const featureHandler = new FeatureHandler({
		FEATURE_V2: true,
	});

	// hooks
	beforeAll(() => {
		render(
			<FeatureProvider handler={featureHandler}>
				<___ComponentName___ title='sample' />
			</FeatureProvider>,
		);
	});

	// tests
	test('has heading level 1 with "sample" content', () => {
		const heading = screen.getByRole('heading');

		expect(heading.textContent).toBe('sample');
	});

	test('has span with component name content', () => {
		const span = screen.getByText('___ComponentName___V2');

		expect(span.tagName).toBe('SPAN');
	});
});
