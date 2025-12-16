import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig, mergeConfig } from "vitest/config";

import baseViteConfig from "./vite.config";

const viteConfig = typeof baseViteConfig === "function"
  ? baseViteConfig({ mode: "test" })
  : baseViteConfig;

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "tests/setup.js",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
      reporters: process.env.GITHUB_ACTIONS ? ["dot", "github-actions"] : ["dot"],
    },
  }),
);
