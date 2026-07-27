import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import commonjs from "vite-plugin-commonjs";
import svgr from "vite-plugin-svgr";

import {
  DASHBOARD_DEVELOPMENT_PORT,
  DASHBOARD_PREVIEW_PORT,
} from "@repo/common/constants";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
    react(),
    commonjs(),
    svgr(),
    visualizer({
      open: true,
      filename: "dist/deps.html",
    }),
  ],
  server: {
    port: DASHBOARD_DEVELOPMENT_PORT,
    strictPort: true,
  },
  preview: {
    port: DASHBOARD_PREVIEW_PORT,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      onLog(level, log, handler) {
        // Ignore warnings mentioning "date-fns" (ESM-only library).
        if (level === "warn" && log.message?.includes("date-fns")) {
          return;
        }
        handler(level, log);
      },
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/]react/,
            },
            {
              name: "zod-vendor",
              test: /node_modules[\\/]zod/,
            },
            {
              name: "date-fns-vendor",
              test: /node_modules[\\/]date-fns/,
            },
          ],
        },
      },
    },
  },
});
