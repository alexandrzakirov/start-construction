import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/start-construction/',
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html') },
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash][extname]'
      }
    }
  },
  server: { port: 5173, open: true, cors: true },
  preview: { port: 4173 }
})
