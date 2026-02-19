import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({

  plugins: [react()].filter(Boolean),
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
