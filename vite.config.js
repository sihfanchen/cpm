import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 請將 'your-repo-name' 替換為您在 GitHub 上建立的儲存庫名稱。
// 如果您的網址是 username.github.io (沒有子路徑)，則設為 '/'。
const BASE_PATH = '/cpm/'; // 儲存庫名稱已設定為 cpm

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: BASE_PATH, // 設定專案的基底公開路徑
  build: {
    // 確保輸出的檔案路徑正確
    outDir: 'dist',
  }
})