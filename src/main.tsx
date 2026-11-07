import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (bundled by Vite, no Google Fonts request). Latin subset covers Á, Ñ, ¿.
import '@fontsource/oswald/latin-500.css'
import '@fontsource/oswald/latin-700.css'
import '@fontsource/share-tech-mono/latin-400.css'
import '@fontsource/vt323/latin-400.css'
import '@fontsource/permanent-marker/latin-400.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
