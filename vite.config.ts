import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [tanstackRouter(), react(), tailwindcss()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/estadisticas': {
        target: 'https://webapps.supen.fi.cr',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
