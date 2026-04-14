import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/echoes-lighthouse/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'data-npcs':      ['./src/data/npcs/index.ts'],
          'data-quests':    ['./src/data/quests/index.ts'],
          'data-codex':     ['./src/data/codex/index.ts'],
          'data-locations': ['./src/data/locations/index.ts'],
        },
      },
    },
  },
})
