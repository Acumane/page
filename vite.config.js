import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/media': {
        target: 'https://media.bren.page',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/media/, ''),
      },
    },
  },
})
