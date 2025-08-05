import { DASHBOARD_PORT } from "@repo/common/constants";
import commonjs from "vite-plugin-commonjs";
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    commonjs(),
    visualizer({
      open: true,
      filename: "dist/deps.html",
    }),
  ],
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
          "date-fns": ["date-fns"],
          recharts: ["recharts/es6"],
          "react-router": ["react-router"],
          zod: ["zod"],
        },
      },
    },
  },
});
