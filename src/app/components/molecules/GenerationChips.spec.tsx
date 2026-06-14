import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { renderWithProviders } from '../../__tests__/render.tsx';
import { GenerationChips } from './GenerationChips.tsx';

describe('GenerationChips', () => {
	afterEach(cleanup);

	test('renders all generation regions', () => {
		renderWithProviders(<GenerationChips />);

		expect(screen.getByText('Kanto')).toBeInTheDocument();
		expect(screen.getByText('Paldea')).toBeInTheDocument();
	});
});
