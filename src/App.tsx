import './App.css'
import { ThemeProvider } from './components/providers/theme-provider'

// src/App.tsx
export default function App({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			enableSystem
			disableTransitionOnChange={true}
		>
			<div className='h-dvh w-dvw'>{children}</div>
		</ThemeProvider>
	);
}

