import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tanstackRouter from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [tanstackRouter(), react(), tailwindcss()],
  build: {
    // Code splitting (Fase 3): separa dependencias pesadas en chunks propios para
    // reducir el bundle inicial y mejorar la carga. `recharts` es la mayor parte
    // del peso y solo se necesita al abrir un reporte con gráficos.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('recharts') || id.includes('d3-') || id.includes('/victory-vendor/')) {
            return 'charts'
          }
          if (
            id.includes('@tanstack') ||
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'react'
          }
          return 'vendor'
        },
      },
    },
  },
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
