import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// /api/* is served by Vercel Functions (see api/). Locally, run `npm run dev:vercel`
// (vercel dev), which starts Vite and the functions behind the same origin.
// Plain `npm run dev` serves the UI only and shows the "SIN SEÑAL" state.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // reachable from phones on the same Wi-Fi
  },
})
