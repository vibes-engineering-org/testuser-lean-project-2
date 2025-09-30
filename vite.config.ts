import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { PROJECT_TITLE } from "./src/lib/constants.ts";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const htmlPlugin = () => ({
  name: "html-transform",
  transformIndexHtml(html: string) {
    const url =
      process.env.VITE_URL ||
      process.env.NEXT_PUBLIC_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
      (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
      "http://localhost:5173";

    return html
      .replace(/{{APP_URL}}/g, url)
      .replace(/{{PROJECT_TITLE}}/g, PROJECT_TITLE);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlPlugin(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          wagmi: ["wagmi", "viem"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
