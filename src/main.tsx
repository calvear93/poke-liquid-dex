import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.tsx';
import 'uno.css';

const root = createRoot(document.getElementById('app')!);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
