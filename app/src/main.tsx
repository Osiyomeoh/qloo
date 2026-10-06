import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LiveClient, SampleClient } from './qloo/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App client={import.meta.env.VITE_LIVE === '1' ? new LiveClient() : new SampleClient()} />
  </StrictMode>,
)
