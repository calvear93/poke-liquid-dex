import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { MoveList } from './MoveList.tsx';

describe('MoveList', () => {
	afterEach(cleanup);

	test('renders each move name', () => {
		render(<MoveList names={['Placaje', 'Látigo Cepa']} />);

		expect(screen.getByText('Placaje')).toBeInTheDocument();
		expect(screen.getByText('Látigo Cepa')).toBeInTheDocument();
	});
});
