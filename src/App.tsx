import './App.css'


// src/App.tsx
export default function App({ children }: { children: React.ReactNode }) {
	return <div className='h-dvh w-dvw'>{children}</div>;
}

