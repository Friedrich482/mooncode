import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["dist/**"],
    server: {
      deps: { inline: ["bcrypt", "resend"] },
    },
    mockReset: true,
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  plugins: [swc.vite()],
});
