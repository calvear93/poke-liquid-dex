import styles from './IconButton.module.css';

/**
 * Circular glass icon button.
 *
 * @returns icon button
 */
export const IconButton = ({
	active = false,
	children,
	className,
	label,
	...rest
}: IconButtonProps): React.ReactElement => (
	<button
		aria-label={label}
		className={[styles.button, active && styles.active, className]
			.filter(Boolean)
			.join(' ')}
		title={label}
		type='button'
		{...rest}
	>
		{children}
	</button>
);

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	label: string;
	active?: boolean;
}
