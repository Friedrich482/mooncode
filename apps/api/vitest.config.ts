import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["dist/**"],
    server: {
      deps: { inline: ["bcrypt"] },
    },
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
