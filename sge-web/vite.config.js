import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "sge-ui": path.resolve(__dirname, "../packages/sge-ui/src") },
  },
  server: {
    port: 5175,
    proxy: {
      "/api": { target: "http://localhost:3020", changeOrigin: true },
    },
  },
});
