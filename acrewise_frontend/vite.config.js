import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const nimBuildEnv = {
  VITE_NIM_API1: process.env.NIM_API1 || process.env.VITE_NIM_API1 || '',
  VITE_NIM1: process.env.NIM1 || process.env.VITE_NIM1 || '',
  VITE_NIM2: process.env.NIM2 || process.env.VITE_NIM2 || '',
  VITE_NIM3: process.env.NIM3 || process.env.VITE_NIM3 || '',
  VITE_NIM4: process.env.NIM4 || process.env.VITE_NIM4 || '',
  VITE_NIM5: process.env.NIM5 || process.env.VITE_NIM5 || ''
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  define: {
    __NIM_API_KEYS__: JSON.stringify(nimBuildEnv),
  },
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
