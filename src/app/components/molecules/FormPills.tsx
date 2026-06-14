import styles from './FormPills.module.css';

export interface FormPillItem {
	label: string;
	url: string;
}

/**
 * Selectable pills for a species' alternate forms.
 *
 * @returns form pills
 */
export const FormPills = ({
	activeUrl,
	items,
	onSelect,
}: FormPillsProps): React.ReactElement => (
	<div className={styles.pills}>
		{items.map((item) => (
			<button
				className={[
					styles.pill,
					item.url === activeUrl && styles.active,
				]
					.filter(Boolean)
					.join(' ')}
				key={item.url}
				onClick={() => onSelect(item.url)}
				type='button'
			>
				{item.label}
			</button>
		))}
	</div>
);

export interface FormPillsProps {
	activeUrl: string;
	items: FormPillItem[];
	onSelect: (url: string) => void;
}
