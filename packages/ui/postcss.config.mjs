import { join } from "path";

const config = {
  plugins: {
    "@tailwindcss/postcss": {
      base: join(__dirname, "../../"),
    },
  },
};

export default config;
