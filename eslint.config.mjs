// ESLint flat config (ESLint 9). Next 15's shareable configs are still in the legacy
// format, so they are loaded through FlatCompat. @eslint/eslintrc ships with ESLint
// itself (it is one of eslint's own dependencies), so nothing extra is installed.
//
// `next build` runs this config too: lint ERRORS fail the build (and the deploy).
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "cloudflare-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
