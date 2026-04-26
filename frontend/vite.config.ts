import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 生产环境挂载在 https?://www.luliming.xyz/investmentDecision 下
// 本地 dev 时也会带前缀，请用 http://localhost:5173/investmentDecision/ 访问
export default defineConfig({
  base: '/investmentDecision/',
  plugins: [react(), tailwindcss()],
})
