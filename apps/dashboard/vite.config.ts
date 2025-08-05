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
      filename: "dist/stats.html",
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
        manualChunks(id) {
          if (id.includes("node_modules/recharts")) {
            if (
              id.includes("recharts/es6/chart") ||
              id.includes("recharts/es6/component")
            ) {
              return "recharts-core";
            }
            if (
              id.includes("recharts/es6/cartesian/Line") ||
              id.includes("recharts/es6/component/LineChart")
            ) {
              return "recharts-line";
            }
            if (
              id.includes("recharts/es6/cartesian/Bar") ||
              id.includes("recharts/es6/component/BarChart")
            ) {
              return "recharts-bar";
            }
            return "recharts";
          }

          if (id.includes("node_modules/d3-hierarchy")) {
            return "d3";
          }

          if (id.includes("node_modules/react-router")) {
            return "react-router";
          }

          if (id.includes("node_modules/zod")) {
            return "zod";
          }

          if (id.includes("node_modules/@floating-ui")) {
            return "floating-ui";
          }

          if (id.includes("node_modules/@radix-ui")) {
            return "radix-ui";
          }

          if (id.includes("node_modules/date-fns")) {
            return "date-fns";
          }

          if (id.includes("node_modules/d3-")) {
            return "d3-utilities";
          }

          if (
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/@tanstack/query-core")
          ) {
            return "react-query";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
