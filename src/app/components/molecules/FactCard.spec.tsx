import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { FactCard } from './FactCard.tsx';

describe('FactCard', () => {
	afterEach(cleanup);

	test('renders the label and value', () => {
		render(<FactCard label='Altura' value='0,7 m' />);

		expect(screen.getByText('Altura')).toBeInTheDocument();
		expect(screen.getByText('0,7 m')).toBeInTheDocument();
	});
});
