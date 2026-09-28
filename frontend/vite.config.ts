import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Le backend Django est joint via /api sur la MÊME origine que l'interface : les cookies
// de session (HttpOnly, SameSite=Strict) restent ainsi internes au site.
// En production, le serveur web (Nginx…) joue ce rôle de proxy.
const API_TARGET = process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // changeOrigin désactivé : Django voit l'hôte de l'interface, cohérent avec l'en-tête
      // Origin envoyé par le navigateur (contrôle CSRF).
      '/api': { target: API_TARGET, changeOrigin: false },
    },
  },
  preview: {
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: false },
    },
  },
})
