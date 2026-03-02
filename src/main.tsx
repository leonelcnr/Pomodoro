import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { router } from './Routes'
import { RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <RouterProvider router={router} />
      <Analytics />
    </App>
  </StrictMode>,
)
