import {
	STAT_ES,
	TYPE_COLOR,
	TYPE_ES,
} from '../constants/pokedex.constants.ts';
import { capitalize } from './format.utils.ts';

export interface ShareCardData {
	id: number;
	fallbackUrl: string;
	imageUrl: string;
	name: string;
	num: string;
	stats: { key: string; value: number }[];
	tint: string;
	types: string[];
}

const WIDTH = 800;
const HEIGHT = 1040;
const SCALE = 2;
const PADDING = 52;

const hexToRgb = (hex: string): [number, number, number] => {
	let value = hex.replace('#', '');

	if (value.length === 3) {
		value = [...value].map((char) => char + char).join('');
	}

	return [
		Number.parseInt(value.slice(0, 2), 16),
		Number.parseInt(value.slice(2, 4), 16),
		Number.parseInt(value.slice(4, 6), 16),
	];
};

const mix = (a: string, b: string, t: number): string => {
	const from = hexToRgb(a);
	const to = hexToRgb(b);
	const channel = (index: number): number =>
		Math.round(from[index] + (to[index] - from[index]) * t);

	return `rgb(${channel(0)},${channel(1)},${channel(2)})`;
};

const roundRect = (
	ctx: CanvasRenderingContext2D,
	rect: { h: number; r: number; w: number; x: number; y: number },
): void => {
	const { h, r, w, x, y } = rect;
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
};

const loadImage = (
	src: string,
	fallback: string,
): Promise<HTMLImageElement | null> =>
	new Promise((resolve) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.addEventListener('load', () => resolve(image));
		image.addEventListener('error', () => {
			if (image.src.endsWith(fallback)) {
				resolve(null);

				return;
			}

			image.src = fallback;
		});
		image.src = src;
	});

const drawCard = async (data: ShareCardData): Promise<HTMLCanvasElement> => {
	const canvas = document.createElement('canvas');
	canvas.width = WIDTH * SCALE;
	canvas.height = HEIGHT * SCALE;

	const ctx = canvas.getContext('2d');

	if (!ctx) return canvas;

	ctx.scale(SCALE, SCALE);

	try {
		await document.fonts.ready;
	} catch {
		// fonts optional
	}

	const tint = data.tint || '#5b8cff';

	const background = ctx.createLinearGradient(0, 0, 0, HEIGHT);
	background.addColorStop(0, tint);
	background.addColorStop(0.5, mix(tint, '#0b0a16', 0.55));
	background.addColorStop(1, '#0b0a16');
	ctx.fillStyle = background;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	const glow = ctx.createRadialGradient(
		WIDTH / 2,
		120,
		40,
		WIDTH / 2,
		120,
		540,
	);
	glow.addColorStop(0, 'rgba(255,255,255,.26)');
	glow.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	// header
	ctx.textAlign = 'left';
	ctx.fillStyle = 'rgba(255,255,255,.75)';
	ctx.font = "700 22px 'Manrope',sans-serif";
	ctx.fillText('P O K É D E X', PADDING, 78);
	ctx.textAlign = 'right';
	ctx.fillStyle = 'rgba(255,255,255,.65)';
	ctx.font = "700 24px 'Space Mono',monospace";
	ctx.fillText(data.num, WIDTH - PADDING, 78);

	// name
	ctx.textAlign = 'left';
	ctx.fillStyle = '#fff';
	const name = capitalize(data.name);
	ctx.font = `800 ${name.length > 11 ? 50 : 64}px 'Bricolage Grotesque',sans-serif`;
	ctx.fillText(name, PADDING, 150);

	// type pills
	let pillX = PADDING;
	ctx.font = "700 22px 'Manrope',sans-serif";
	for (const type of data.types) {
		const label = (TYPE_ES[type] ?? type).toUpperCase();
		const width = ctx.measureText(label).width + 36;
		ctx.fillStyle = TYPE_COLOR[type] ?? '#777';
		roundRect(ctx, { h: 40, r: 20, w: width, x: pillX, y: 176 });
		ctx.fill();
		ctx.fillStyle = '#fff';
		ctx.textAlign = 'left';
		ctx.fillText(label, pillX + 18, 203);
		pillX += width + 10;
	}

	// artwork
	const image = await loadImage(data.imageUrl, data.fallbackUrl);

	if (image) {
		const size = 440;
		const x = (WIDTH - size) / 2;
		const y = 248;
		ctx.fillStyle = 'rgba(0,0,0,.35)';
		ctx.beginPath();
		ctx.ellipse(
			WIDTH / 2,
			y + size - 46,
			size * 0.33,
			28,
			0,
			0,
			Math.PI * 2,
		);
		ctx.fill();
		ctx.drawImage(image, x, y, size, size);
	}

	// stats panel
	const panelX = PADDING;
	const panelW = WIDTH - PADDING * 2;
	const panelY = 720;
	const panelH = 250;
	ctx.fillStyle = 'rgba(255,255,255,.10)';
	roundRect(ctx, { h: panelH, r: 28, w: panelW, x: panelX, y: panelY });
	ctx.fill();

	const rowH = panelH / data.stats.length;

	for (const [index, stat] of data.stats.entries()) {
		const cy = panelY + index * rowH + rowH / 2;
		ctx.textAlign = 'left';
		ctx.fillStyle = 'rgba(255,255,255,.85)';
		ctx.font = "700 18px 'Manrope',sans-serif";
		ctx.fillText(STAT_ES[stat.key] ?? stat.key, panelX + 22, cy + 6);
		ctx.textAlign = 'right';
		ctx.fillStyle = '#fff';
		ctx.font = "700 18px 'Space Mono',monospace";
		ctx.fillText(String(stat.value), panelX + panelW - 22, cy + 6);

		const barX = panelX + 150;
		const barW = panelW - 150 - 70;
		const barH = 12;
		const barY = cy - barH / 2;
		ctx.fillStyle = 'rgba(255,255,255,.18)';
		roundRect(ctx, { h: barH, r: 6, w: barW, x: barX, y: barY });
		ctx.fill();
		const ratio = Math.min(1, stat.value / 200);
		const hue = Math.round(ratio * 120);
		ctx.fillStyle = `hsl(${hue} 80% 55%)`;
		roundRect(ctx, {
			h: barH,
			r: 6,
			w: Math.max(barH, barW * ratio),
			x: barX,
			y: barY,
		});
		ctx.fill();
	}

	ctx.textAlign = 'center';
	ctx.fillStyle = 'rgba(255,255,255,.5)';
	ctx.font = "600 16px 'Manrope',sans-serif";
	ctx.fillText('Datos: PokéAPI  ·  Liquid Glass', WIDTH / 2, 1012);

	return canvas;
};

const deliver = async (blob: Blob, data: ShareCardData): Promise<void> => {
	const file = new File([blob], `${data.name}.png`, { type: 'image/png' });

	if (navigator.canShare?.({ files: [file] })) {
		try {
			await navigator.share({
				files: [file],
				text: `${data.name} ${data.num} · Pokédex`,
				title: `${data.name} ${data.num}`,
			});

			return;
		} catch {
			// fall through to download
		}
	}

	const anchor = document.createElement('a');
	anchor.href = URL.createObjectURL(blob);
	anchor.download = `${data.name}.png`;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
};

/**
 * Renders a shareable Pokémon card to a PNG (canvas, no dependencies) and opens
 * the native share sheet when available, otherwise downloads the image.
 */
export const shareCard = async (data: ShareCardData): Promise<void> => {
	const canvas = await drawCard(data);

	await new Promise<void>((resolve) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				resolve();

				return;
			}

			void deliver(blob, data).finally(() => resolve());
		}, 'image/png');
	});
};
