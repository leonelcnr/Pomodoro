import './App.css'
import { ThemeProvider } from './components/providers/theme-provider'

// src/App.tsx
export default function App({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			disableTransitionOnChange={false}
		>
			<div className='h-dvh w-dvw overflow-x-hidden'>{children}</div>

		</ThemeProvider>
	);
}

