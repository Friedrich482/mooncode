import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          globals: true,
          exclude: ["dist/**", "./src/email/utils/**"],
          server: {
            deps: {
              inline: ["bcrypt", "resend", "@trpc/server"],
            },
          },
          mockReset: true,
          unstubEnvs: true,
        },
        resolve: {
          alias: {
            "@": "./src",
          },
        },
        plugins: [swc.vite()],
      },
      {
        test: {
          globals: true,
          exclude: ["dist/**"],
          include: ["./src/email/utils/*.test.tsx"],
          browser: {
            enabled: true,
            headless: process.env.CI === "true",
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./vitest-setup.ts"],
        },
        resolve: {
          alias: {
            "@": "./src",
          },
        },
      },
    ],
    coverage: { reportOnFailure: true },
  },
});
