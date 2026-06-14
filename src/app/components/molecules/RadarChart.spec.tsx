import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { RadarChart } from './RadarChart.tsx';

const stats = [
	{ key: 'hp', value: 45 },
	{ key: 'attack', value: 49 },
	{ key: 'defense', value: 49 },
	{ key: 'special-attack', value: 65 },
	{ key: 'special-defense', value: 65 },
	{ key: 'speed', value: 45 },
];

describe('RadarChart', () => {
	afterEach(cleanup);

	test('renders the radar svg and a legend per entry', () => {
		render(<RadarChart entries={[{ name: 'bulbasaur', stats }]} />);

		expect(
			screen.getByRole('img', { name: 'Gráfico radar de estadísticas' }),
		).toBeInTheDocument();
		expect(screen.getByText('bulbasaur')).toBeInTheDocument();
	});
});
