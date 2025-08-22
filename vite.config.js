import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/eye-shadow-palette-maker/',
  server: {
    port: 3000,
    open: true
  }
})