import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "commander";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(__dirname, "package.json");
const cliInfos = JSON.parse(readFileSync(packageJsonPath, "utf8"));
export function createProgram() {
  const program = new Command();

  program
    .name("feedback-cli")
    .description("Use the feedback api with command line")
    .version(cliInfos.version);

  return program;
}

