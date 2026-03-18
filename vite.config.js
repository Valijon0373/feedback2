import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 3000,
    open: true,
    // proxy: {
    //   "/api": {
    //     target: "https://feedback.urspi.uz",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
})
