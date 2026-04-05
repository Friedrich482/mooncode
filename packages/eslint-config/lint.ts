import simpleImportSort from "eslint-plugin-simple-import-sort";
import checkFile from "eslint-plugin-check-file";

import typescriptParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "@typescript-eslint": typescriptEslint,
      "check-file": checkFile,
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "sort-imports": "off",
      "import/order": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^react", "^@?\\w", "^\\p{L}*\\/.*"], // External libraries (react first, then other external)
            ["^@.*", "^@.*/.*"], // Internal shared libs (@libs/...)
            ["^\\$.*$"], // Absolute imports ($src/...)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"], // Parent relative imports
            ["^\\.\\../\\.\\./.+", "^\\.\\./.+", "^\\.\\/.+"], // Sibling relative imports
            ["^./styles$"], // Style imports
          ],
        },
      ],
      "simple-import-sort/exports": "error", // Also sort exports
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE",
          "*.{ts,tsx}": "KEBAB_CASE",
        },
        {
          // ignore the middle extensions of the filename to support filename like auth.controller.ts
          ignoreMiddleExtensions: true,
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**/!(__tests__)": "KEBAB_CASE",
        },
      ],
    },
  },
];
