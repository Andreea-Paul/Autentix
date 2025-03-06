import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';  // Importă path pentru a folosi aliasul

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // Adăugăm aliasul pentru `@` care va corespunde folderului `src`
    },
  },
})
