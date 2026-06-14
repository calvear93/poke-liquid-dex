import { type PropsWithChildren } from 'react';
import styles from './___LayoutName___.layout.module.css';

/**
 * ___LayoutName___ layout.
 *
 * @returns layout
 */
export const ___LayoutName___Layout = ({
	children,
}: ___LayoutName___LayoutProps) => {
	return <main className={styles.layout}>{children}</main>;
};

export interface ___LayoutName___LayoutProps extends Required<PropsWithChildren> {}
