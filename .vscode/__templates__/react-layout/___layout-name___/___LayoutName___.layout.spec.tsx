import { beforeAll, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ___LayoutName___Layout } from './___LayoutName___.layout.tsx';

describe(___LayoutName___Layout, () => {
	beforeAll(() => {
		render(
			<___LayoutName___Layout>
				<article>Any Content</article>
			</___LayoutName___Layout>,
		);
	});

	test('child must be rendered with "Any Content"', () => {
		const article = screen.getByRole('article');

		expect(article.textContent).toBe('Any Content');
	});
});
