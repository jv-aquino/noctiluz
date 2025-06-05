import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 import { resolve } from 'path'
 
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    environment: 'node',
    setupFiles: ['./tests/integration/setup.ts'],
    alias: [
      { 
        find: '@/backend',
        replacement: resolve(__dirname, './src/app/(backend)') 
      },
      {
        find: '@/frontend',
        replacement: resolve(__dirname, './src/app/(frontend)')
      },
      {
        find: '@',
        replacement: resolve(__dirname, './src')
      },
    ],
  server: {
    deps: {
      inline: ['next']
    }
  },
  }
})