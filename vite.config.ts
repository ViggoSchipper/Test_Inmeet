import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Versie-aanduiding onderaan de app, zodat je op de iPad kunt zien of je de
// nieuwste versie hebt. Netlify geeft de commit mee als COMMIT_REF.
const commit = (process.env.COMMIT_REF || 'lokaal').slice(0, 7)
const gebouwd = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSIE__: JSON.stringify(`${commit} (${gebouwd})`),
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'TS_ERROR') return
        warn(warning)
      }
    }
  }
})
