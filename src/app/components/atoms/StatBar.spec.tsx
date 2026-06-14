import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { StatBar } from './StatBar.tsx';

describe('StatBar', () => {
	afterEach(cleanup);

	test('renders the Spanish stat label and value', () => {
		render(<StatBar statKey='hp' value={78} />);

		expect(screen.getByText('PS')).toBeInTheDocument();
		expect(screen.getByText('78')).toBeInTheDocument();
	});
});
