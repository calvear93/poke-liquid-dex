import { lazy } from 'react';
import { withFeatures } from '#libs/feature';
import { ___ComponentName___V2 } from './___ComponentName___.v1.tsx';

/**
 * ___ComponentName___ component.
 *
 * @returns component
 */
export const ___ComponentName___ = withFeatures<___ComponentName___Props>({
	fallback: <h1>No Features Enabled</h1>,
	features: {
		FEATURE_V2: ___ComponentName___V2,
		// lazy load chunk
		FEATURE_V1: lazy(() =>
			import('./___ComponentName___.v2.tsx').then(
				({ ___ComponentName___V1 }) => ({
					default: ___ComponentName___V1,
				}),
			),
		),
	},
	loading: <h2>Loading Feature</h2>,
});

export interface ___ComponentName___Props {
	title?: string;
}
