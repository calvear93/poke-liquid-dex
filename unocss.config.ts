import {
	transformerDirectives,
	transformerVariantGroup,
	type UserConfig,
} from 'unocss';
import icons from 'unocss/preset-icons';
import typography from 'unocss/preset-typography';
import wind from 'unocss/preset-wind3';

const FONT_FAMILY = process.env.FONT_FAMILY;

export default {
	presets: [typography(), wind(), icons()],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	theme: {
		colors: {
			primary: '#00b2a9',
		},
		font: {
			sans: [FONT_FAMILY, 'sans-serif'],
			serif: [FONT_FAMILY, 'serif'],
		},
	},
} satisfies UserConfig;
