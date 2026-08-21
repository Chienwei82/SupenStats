import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/estadisticas': {
        target: 'https://webapps.supen.fi.cr',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
