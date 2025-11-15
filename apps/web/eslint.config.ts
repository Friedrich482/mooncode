import nextVitals from "eslint-config-next/core-web-vitals";

import commonLintConfig from "@repo/eslint-config/lint";

const config = [
  ...commonLintConfig,
  ...nextVitals,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default config;
