import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/.git',
        '**/.git/**',
        '**/.aws',
        '**/.aws/**',
        '**/.codex',
        '**/.codex/**',
        '**/.agents',
        '**/.agents/**',
        '**/node_modules',
        '**/node_modules/**',
        '**/dist',
        '**/dist/**',
      ],
    },
  },
})
