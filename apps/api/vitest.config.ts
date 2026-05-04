import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["dist/**"],
    server: {
      deps: { inline: ["bcrypt"] },
    },
    mockReset: true,
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
