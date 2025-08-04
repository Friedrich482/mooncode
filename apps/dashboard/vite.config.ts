import { DASHBOARD_PORT } from "@repo/common/constants";
import commonjs from "vite-plugin-commonjs";
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react(), commonjs()],
  server: {
    port: DASHBOARD_PORT,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          d3: ["d3-hierarchy"],
          recharts: ["recharts"],
          "react-router": ["react-router"],
          zod: ["zod"],
        },
      },
    },
  },
});
