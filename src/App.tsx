import './App.css'


// src/App.tsx
export default function App({ children }: { children: React.ReactNode }) {
	return <div className='dark bg-black'>{children}</div>;
}

