import { defineConfig } from 'vite'
import { resolve } from 'path'
import pkg from './package.json'

export default defineConfig({
  base: '/echoes-lighthouse/',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsInlineLimit: 2 * 1024 * 1024,
    // Warn (and fail CI) if any JS chunk exceeds 600 KB
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
})
