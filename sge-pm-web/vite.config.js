import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Em produção Docker: VITE_BASE_PATH=/16flow  →  assets e rotas sob /16flow/ */
const base = process.env.VITE_BASE_PATH
  ? (process.env.VITE_BASE_PATH.endsWith("/") ? process.env.VITE_BASE_PATH : `${process.env.VITE_BASE_PATH}/`)
  : "/";

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: "http://localhost:3010", changeOrigin: true },
      "/crawl": { target: "http://localhost:3010", changeOrigin: true },
    },
  },
});
