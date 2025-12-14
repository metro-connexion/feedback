import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vitestGlobals from "eslint-plugin-vitest-globals";
import globals from "globals";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
      jsdoc,
    },
    extends: [js.configs.recommended],
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": [
        "error",
        {
          before: false,
          after: true,
        },
      ],
      "object-curly-spacing": ["error", "always"],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "block", next: "block" },
        { blankLine: "always", prev: "function", next: "function" },
        { blankLine: "always", prev: "class", next: "function" },
      ],
      "prefer-const": ["error"],
      "space-before-blocks": ["error"],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "ignore",
        },
      ],
      "space-in-parens": ["error"],
      "space-infix-ops": ["error"],
      "func-call-spacing": ["error"],
      "key-spacing": ["error"],
      "no-trailing-spaces": ["error"],
      "no-multi-spaces": ["error"],
      "func-style": ["error", "declaration", { allowArrowFunctions: false }],
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-param-names": "warn",
      "jsdoc/check-property-names": "warn",
      "jsdoc/check-tag-names": ["warn", { definedTags: ["swagger"] }],
      "jsdoc/check-types": "warn",
      "jsdoc/empty-tags": "warn",
      "jsdoc/require-param": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-param-name": "warn",
      "jsdoc/require-param-type": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/require-returns-type": "warn",
      "jsdoc/valid-types": "warn",
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["./tests/**/*_test.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...vitestGlobals,
      },
    },
  },
  {
    ignores: ["./dist/*"],
  },
]);
