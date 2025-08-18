import { DASHBOARD_PORT, DASHBOARD_PREVIEW_PORT } from "@repo/common/constants";
import commonjs from "vite-plugin-commonjs";
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    commonjs(),
    svgr(),
    visualizer({
      open: true,
      filename: "dist/deps.html",
    }),
  ],
  server: {
    port: DASHBOARD_PORT,
  },
  preview: {
    port: DASHBOARD_PREVIEW_PORT,
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
      onLog(level, log, handler) {
        // Ignore warnings mentioning "date-fns" (ESM-only library).
        if (level === "warn" && log.message?.includes("date-fns")) {
          return;
        }
        handler(level, log);
      },
      output: {
        manualChunks: {
          d3: [
            "d3-hierarchy",
            "d3-shape",
            "d3-array",
            "d3-scale",
            "d3-color",
            "d3-format",
          ],
          datefns: ["date-fns"],
          reactrouter: ["react-router"],
          zod: ["zod"],
          trpc: ["@trpc/client", "@trpc/server"],
          reacthookform: ["react-hook-form"],
          query: [
            "@tanstack/react-query",
            "@tanstack/query-core",
            "@tanstack/react-query-devtools",
          ],
        },
      },
    },
  },
});
