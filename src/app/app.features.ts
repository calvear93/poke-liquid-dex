import { FeatureHandler, linkStorageToFeatureHandler } from '#libs/feature';

/**
 * This module centralizes all feature flags for the application, providing
 * a clean way for feature toggling and gradual rollouts. Features can
 * be controlled via configuration and overridden through localStorage/sessionStorage
 * for development and testing purposes.
 *
 * @example
 * ```tsx
 * import { useFeature } from '#libs/feature';
 *
 * export const UserDashboard: React.FC = () => {
 * 	const isV2Enabled = useFeature('FEATURE_V2');
 *
 * 	return (
 * 		<div>
 * 			{isV2Enabled ? (
 * 				<NewDashboardV2 />
 * 			) : (
 * 				<LegacyDashboard />
 * 			)}
 * 		</div>
 * 	);
 * };
 * ```
 *
 * Feature Naming Conventions:
 * - Use SCREAMING_SNAKE_CASE for feature flag names
 * - Prefix with category when applicable (UI_, API_, ANALYTICS_)
 * - Use descriptive names that indicate the feature's purpose
 * - Avoid negatives (prefer FEATURE_ENABLED over FEATURE_DISABLED)
 *
 * Storage Priority:
 * 1. sessionStorage (highest priority, temporary override)
 * 2. localStorage (persistent override for development)
 * 3. FeatureHandler configuration (default application state)
 */
export const featureHandler = new FeatureHandler({});

// connects local and session storage to feature handler
linkStorageToFeatureHandler(featureHandler);
