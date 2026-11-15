import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Ported Ultra Proxy template (ultra-proxy-next-main). Third-party code
    // written under a laxer lint setup: keep the design/behaviour untouched
    // and relax only the stylistic/legacy rules it predates. Real hazards
    // (rules-of-hooks, ref-during-render) are fixed in the source, not muted.
    files: [
      "components/ultra/**",
      "lib/ultra/**",
      "app/api/ultra/**",
      // Escaped: [lang] is a minimatch char-class, (ultra) an extglob otherwise.
      "app/\\[lang\\]/\\(ultra\\)/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
