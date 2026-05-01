import commonLintConfig from "@repo/eslint-config/lint";

export default [
  ...commonLintConfig,
  {
    files: ["**/*.ts"],
    ignores: ["**/eslint.config.ts", "./dist/**"],
  },
];
