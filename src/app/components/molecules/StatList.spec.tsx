import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { StatList } from './StatList.tsx';

describe('StatList', () => {
	afterEach(cleanup);

	test('renders the stats and the computed total', () => {
		render(
			<StatList
				stats={[
					{ key: 'hp', value: 45 },
					{ key: 'speed', value: 50 },
				]}
			/>,
		);

		expect(screen.getByText('PS')).toBeInTheDocument();
		expect(screen.getByText('Velocidad')).toBeInTheDocument();
		expect(screen.getByText('Total')).toBeInTheDocument();
		expect(screen.getByText('95')).toBeInTheDocument();
	});
});
