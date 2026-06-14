import react from '@vitejs/plugin-react';
import unocss from 'unocss/vite';
import { normalizePath, type UserConfigExport } from 'vite';
import { VitePWA as pwa } from 'vite-plugin-pwa';
import fonts from 'vite-plugin-webfont-dl';
import { compilerOptions as tsconfig } from './tsconfig.json';

const FONT_FAMILY = process.env.FONT_FAMILY;
const FONT_WEIGHTS = process.env.FONT_WEIGHTS;
const BASE_PATH = normalizePath(`/${process.env.BASE_URL}`);

export default {
	base: BASE_PATH,
	clearScreen: false,
	envPrefix: 'APP_',
	build: {
		minify: true,
		sourcemap: tsconfig.sourceMap,
		target: 'baseline-widely-available',
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: 'react',
							priority: 100,
							test: /(?:^|\/)(?:react|react-dom)(?:$|\/)/u,
						},
						{
							name: 'router',
							priority: 100,
							test: /node_modules\/react-router/u,
						},
						{
							name: 'store',
							priority: 100,
							test: /node_modules\/jotai/u,
						},
						{
							name: 'libs-router',
							priority: 20,
							test: /src\/libs\/router/u,
						},
						{
							name: 'libs-ioc',
							priority: 20,
							test: /src\/libs\/ioc/u,
						},
						{
							name: 'libs-feature',
							priority: 20,
							test: /src\/libs\/feature/u,
						},
						{
							name: 'libs-cache',
							priority: 20,
							test: /src\/libs\/cache/u,
						},
					],
				},
			},
		},
	},
	plugins: [
		react(),
		unocss(),
		fonts(
			[
				`https://fonts.googleapis.com/css2?family=${FONT_FAMILY}:wght@${FONT_WEIGHTS}&display=swap`,
				'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&display=swap',
				'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
			],
			{
				injectAsStyleTag: false,
				minifyCss: true,
			},
		),
		pwa({
			disable: process.env.SERVICE_WORKER === 'false',
			injectRegister: 'inline',
			manifest: false,
			registerType: 'autoUpdate',
			devOptions: {
				enabled: false,
			},
			workbox: {
				cleanupOutdatedCaches: true,
				sourcemap: tsconfig.sourceMap,
				globPatterns: [
					'**/*.{html,js,css,ico,png,svg,webp,avif,woff2}',
				],
				runtimeCaching: [
					{
						handler: 'CacheFirst',
						options: {
							cacheableResponse: { statuses: [0, 200] },
							cacheName: 'poke-assets',
							expiration: {
								maxAgeSeconds: 60 * 60 * 24 * 30,
								maxEntries: 2000,
							},
						},
						urlPattern:
							/^https:\/\/raw\.githubusercontent\.com\/.*/iu,
					},
					{
						handler: 'CacheFirst',
						urlPattern: /^https:\/\/pokeapi\.co\/.*/iu,
						options: {
							cacheableResponse: { statuses: [0, 200] },
							cacheName: 'poke-api',
							expiration: {
								maxAgeSeconds: 60 * 60 * 24 * 30,
								maxEntries: 3000,
							},
						},
					},
				],
			},
		}),
	],
	preview: {
		cors: true,
		open: false,
	},
	server: {
		cors: true,
		open: false,
		port: +process.env.PORT!,
	},
} satisfies UserConfigExport;
