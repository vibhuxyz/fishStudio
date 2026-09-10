import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import pluginReactHooks from "eslint-plugin-react-hooks";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    // rules-of-hooks, in the base config rather than only the Next one,
    // because no app in this repo actually loads the Next config — so the
    // check never ran anywhere. A hook called after an early return changes
    // the hook count between renders, which React turns into a hard
    // "Rendered more hooks than during the previous render" crash that takes
    // the whole page down. That is a runtime failure, not a style preference.
    //
    // Scoped to JSX/TSX so the node services don't pay to parse for it.
    files: ["**/*.{jsx,tsx}"],
    plugins: { "react-hooks": pluginReactHooks },
    rules: { "react-hooks/rules-of-hooks": "error" },
  },
  {
    // NB: downgrades everything above to a warning, repo-wide and by design.
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
];
