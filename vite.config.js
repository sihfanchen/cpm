import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 必須是 /cpm/，因為您的儲存庫名稱是 cpm
const BASE_PATH = '/cpm/'; 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: BASE_PATH, // <--- 這裡必須是 /cpm/
  build: {
    outDir: 'dist',
  }
})