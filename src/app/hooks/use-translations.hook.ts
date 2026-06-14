import { useEffect, useState } from 'react';
import { useInjection } from '../app.ioc.ts';
import { PokeApiService } from '../services/pokeapi.service.ts';

/**
 * Resolves Spanish names for a list of ability/move urls in the background
 * (cached in the service). Returns slugs translated in order; empty until ready.
 */
export const useTranslations = (urls: string[]): string[] => {
	const service = useInjection(PokeApiService);
	const [names, setNames] = useState<string[]>([]);
	const key = urls.join('|');

	useEffect(() => {
		if (urls.length === 0) {
			setNames([]);

			return;
		}

		let active = true;

		const run = async (): Promise<void> => {
			try {
				const result = await service.translate(urls);

				if (active) setNames(result);
			} catch {
				// translations are best-effort
			}
		};

		void run();

		return () => {
			active = false;
		};
		// `key` is the stable string representation of `urls`
	}, [service, key]);

	return names;
};
