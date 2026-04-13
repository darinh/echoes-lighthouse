import { defineConfig } from 'vite'

export default defineConfig({
  base: '/echoes-lighthouse/',
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
