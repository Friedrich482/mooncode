import commonLintConfig from "@repo/eslint-config/lint";

export default [
  ...commonLintConfig,
  {
    ignores: ["**/eslint.config.ts", "./dist/**"],
  },
];
