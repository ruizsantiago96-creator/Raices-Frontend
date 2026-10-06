import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
  },
  optimizeDeps: {
    // El worker de maplibre-gl v6 puede fallar durante el pre-bundling de deps.
    exclude: ['maplibre-gl'],
  },
  worker: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/media/[name]-[hash][extname]',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const names = assetInfo.names || assetInfo.originalFileNames || []
          const name = names[names.length - 1] || ''

          if (name.endsWith('.css')) return 'assets/css/[name]-[hash][extname]'
          if (/\.(woff2?|ttf|otf|eot)$/.test(name)) return 'assets/fonts/[name]-[hash][extname]'
          if (/\.(js|mjs|cjs)$/.test(name)) return 'assets/js/[name]-[hash][extname]'
          if (/\.(json|txt|xml|wasm|glsl|bin|dat)$/.test(name)) return 'assets/data/[name]-[hash][extname]'
          return 'assets/media/[name]-[hash][extname]'
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://raices-backend-219843566314.us-central1.run.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
