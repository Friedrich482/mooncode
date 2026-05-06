import commonLintConfig from "@repo/eslint-config/lint";

export default [
  ...commonLintConfig,
  {
    ignores: ["**/dist/*"],
  },
];
