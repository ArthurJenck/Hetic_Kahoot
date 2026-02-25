import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../packages/shared-types'),
      '@sounds': path.resolve(__dirname, '../packages/shared-sounds'),
    },
  },
  server: {
    allowedHosts: true,
    proxy: {
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
})
