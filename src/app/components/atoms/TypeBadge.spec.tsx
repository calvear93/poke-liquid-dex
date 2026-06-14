import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { TypeBadge } from './TypeBadge.tsx';

describe('TypeBadge', () => {
	afterEach(cleanup);

	test('renders the Spanish type label', () => {
		render(<TypeBadge type='fire' />);

		expect(screen.getByText('Fuego')).toBeInTheDocument();
	});

	test('falls back to a capitalized slug for unknown types', () => {
		render(<TypeBadge type='mistery' />);

		expect(screen.getByText('Mistery')).toBeInTheDocument();
	});
});
