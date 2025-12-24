import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { router } from './Routes'
import { RouterProvider } from 'react-router-dom'
import { HeroUIProvider } from '@heroui/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeroUIProvider>
      <App>
        <RouterProvider router={router} />
      </App>
    </HeroUIProvider>
  </StrictMode>,
)
