import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
// import analyzer from 'vite-bundle-analyzer'

// https://vite.dev/config/
const NODE_ENV = process.env.NODE_ENV === 'development'
const outDir = '../dist'
export default defineConfig({
  plugins: [
    react(),
    // 注册 PWA
    VitePWA({ registerType: 'autoUpdate', outDir: outDir })
    // analyzer({
    //   openAnalyzer: false
    // })
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  // 代理
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:17187',
        changeOrigin: true,
        ws: true // 支持 WebSocket 代理
      }
    }
  },
  esbuild: {
    drop: NODE_ENV ? [] : ['console', 'debugger']
  },
  build: {
    sourcemap: NODE_ENV, // 仅开发环境生成 sourcemap
    cssCodeSplit: true, // 开启 CSS 代码分割
    emptyOutDir: true, // 自动清理 dist
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
        dir: outDir,
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          // 自动根据文件类型分类存放
          const ext = name?.split('.').pop()
          if (ext) return `assets/${ext}/[name]-[hash][extname]`
          return 'assets/[name]-[hash][extname]'
        },
        manualChunks: {
          'react-vendor': ['react'],
          'react-router-vendor': [
            'react-dom',
            'react-router-dom',
            'react-router'
          ],
          'react-redux-vendor': ['react-redux', 'redux', '@reduxjs/toolkit'],
          // 让antd自动分配到各个chunk中
          // 'antd-core-vendor': ['antd'],
          'antd-icons-vendor': ['@ant-design/icons'],
          'markdown-vendor': ['markdown-to-jsx'],
          'joyride-vendor': ['react-joyride'],
          'codemirror-vendor': [
            '@codemirror/commands',
            '@codemirror/lang-json',
            '@codemirror/lang-yaml',
            '@codemirror/language',
            '@codemirror/state',
            '@codemirror/view',
            '@uiw/codemirror-themes',
            'codemirror',
            '@uiw/codemirror-theme-github'
          ],
          'utils-vendor': [
            'axios',
            'dayjs',
            'js-yaml',
            'jwt-decode',
            'lodash-es',
            'classnames'
          ],
          'xterm-vendor': [
            'xterm',
            'xterm-addon-fit',
            'xterm-addon-search',
            'xterm-addon-serialize',
            'xterm-addon-unicode11',
            'xterm-addon-web-links'
          ]
        }
      }
    }
  }
})
