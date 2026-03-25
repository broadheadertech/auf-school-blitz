import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { registerServiceWorker } from './lib/service-worker'
import './styles/globals.css'

// Register service worker for PWA + push notifications
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
