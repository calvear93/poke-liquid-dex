import { AppFooter } from '../../components/organisms/AppFooter.tsx';
import { Overlays } from '../../components/organisms/Overlays.tsx';
import { TopBar } from '../../components/organisms/TopBar.tsx';
import styles from './App.layout.module.css';

/**
 * App shell: top bar, routed page, footer and global overlays.
 *
 * @returns app layout
 */
export const AppLayout = ({ children }: AppLayoutProps): React.ReactElement => (
	<div className={styles.app}>
		<TopBar />
		<main className={styles.main}>{children}</main>
		<AppFooter />
		<Overlays />
	</div>
);

export interface AppLayoutProps extends React.PropsWithChildren {}
