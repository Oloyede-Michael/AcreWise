import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      '/graphql': {
        target: 'https://acrewise-9zrp.onrender.com/graphql',
        changeOrigin: true,
      },
      '/api/nim': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nim/, ''),
      },
      '/api': {
        target: 'https://acrewise-9zrp.onrender.com/api',
        changeOrigin: true,
      }
    }
  }
})
