import { DASHBOARD_PORT, DASHBOARD_PREVIEW_PORT } from "@repo/common/constants";
import commonjs from "vite-plugin-commonjs";
import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    tailwindcss(),
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
          md5: ["js-md5"],
          zustand: ["zustand"],
          lucidereact: ["lucide-react"],
          reactdaypicker: ["react-day-picker"],
          radixui: [
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-slot",
            "@radix-ui/react-tooltip",
          ],
          "react-error-boundary": ["react-error-boundary"],
          "react-spinners": ["react-spinners"],
          superjson: ["superjson"],
        },
      },
    },
  },
});
