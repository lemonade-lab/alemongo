import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import react from '@vitejs/plugin-react-swc'
// https://vite.dev/config/
const NODE_ENV = process.env.NODE_ENV === 'development'
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ]
  },
  // 代理
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:17187',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  esbuild: {
    drop: NODE_ENV ? [] : ['console', 'debugger']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    minify: 'terser',
    terserOptions: {
      compress: NODE_ENV
        ? {}
        : {
          drop_console: true,
          drop_debugger: true
        }
    },
    rollupOptions: {
      output: {
        dir: '../dist',
        // 拆分，根据文件分类
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'css/[name]-[hash][extname]'
      }
    }
  }
})