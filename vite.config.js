import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true,
    port: 3000,

    allowedHosts: ['.ngrok-free.app', 'tunnel.levoneapp.ru', 'loyalupp.ru'],

    hmr: {
      protocol: 'wss',
      host: 'tunnel.levoneapp.ru',
      clientPort: 443, // 👈 required for HTTPS
    },

    strictPort: true, // don’t auto-switch ports if 3000 is busy
    watch: {
      usePolling: true, // sometimes required on remote FS / Docker
    },
  },

  build: {
    outDir: 'build',
  },

  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
