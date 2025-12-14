import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src"],
    },
    projects: [
      {
        test: {
          name: "Unit tests",
          setupFiles: ["./tests/setup.js"],
          isolate: true,
          include: ["tests/**/unit/**/*.test.js"],
        },
      },
      {
        test: {
          name: "Integration tests",
          setupFiles: ["./tests/setup.js"],
          include: ["tests/**/integration/**/*.test.js"],
          poolOptions: {
            forks: {
              execArgv: ["--expose-gc"],
              isolate: true,
              singleFork: true,
            },
            threads: {
              memoryLimit: 300,
            },
          },
          maxWorkers: 1,
        },
      },
      {
        test: {
          name: "Acceptance tests",
          setupFiles: ["./tests/setup.js"],
          include: ["tests/**/acceptance/**/*.test.js"],
          poolOptions: {
            forks: {
              execArgv: ["--expose-gc"],
              isolate: true,
              singleFork: true,
            },
          },
        },
      },
    ],
    fileParallelism: false,
    reporters: process.env.GITHUB_ACTIONS
      ? ["dot", "github-actions"]
      : ["dot"],
  },
});
