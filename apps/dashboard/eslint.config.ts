import commonLintConfig from "@repo/eslint-config/lint";
import pluginImports from "eslint-plugin-import";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...commonLintConfig,
  {
    ignores: ["**/eslint.config.ts", "./dist/**"],
  },
  {
    plugins: {
      import: pluginImports,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: __dirname,
          zones: [
            {
              target: "./src/features/auth",
              from: "./src/features",
              except: ["./auth"],
            },
            {
              target: "./src/features/dashboard-title",
              from: "./src/features",
              except: ["./dashboard-title"],
            },
            {
              target: "./src/features/day-languages-chart",
              from: "./src/features",
              except: ["./day-languages-chart"],
            },
            {
              target: "./src/features/files-circle-packing-chart",
              from: "./src/features",
              except: ["./files-circle-packing-chart"],
            },
            {
              target: "./src/features/files-list",
              from: "./src/features",
              except: ["./files-list"],
            },
            {
              target: "./src/features/general-stats-chart",
              from: "./src/features",
              except: ["./general-stats-chart"],
            },
            {
              target: "./src/features/period-languages-chart",
              from: "./src/features",
              except: ["./period-languages-chart"],
            },
            {
              target: "./src/features/period-projects",
              from: "./src/features",
              except: ["./period-projects"],
            },
            {
              target: "./src/features/period-time-chart",
              from: "./src/features",
              except: ["./period-time-chart"],
            },
            {
              target: "./src/features/project-languages-time-on-period-chart",
              from: "./src/features",
              except: ["./project-languages-time-on-period-chart"],
            },
            {
              target: "./src/features/project-time-on-period-chart",
              from: "./src/features",
              except: ["./project-time-on-period-chart"],
            },
            {
              target: "./src/features/project-title",
              from: "./src/features",
              except: ["./project-title"],
            },
            {
              target: "./src/features",
              from: "./src/app",
            },
            {
              target: [
                "./src/components",
                "./src/hooks",
                "./src/loaders",
                "./src/stores",
                "./src/utils",
              ],
              from: ["./src/features", "./src/app"],
            },
          ],
        },
      ],
    },
  },
];
