import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/onemap': {
        target: 'https://www.onemap.gov.sg',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/onemap/, '/api'),
        secure: true,
      },
      '/api/n8n': {
        target: 'https://threeecho.app.n8n.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/n8n/, '/webhook'),
        secure: true,
      },
    },
  },
})
