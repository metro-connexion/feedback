import { Command } from "commander";

import { healthHandler } from "../src/handlers/health-handler.js";

export function createHealthCommand() {
  const cmd = new Command("health")
    .description("Check if api is ok")
    .option("-u, --url <url>", "Api url", "http://localhost:3000")
    .action(async ({ url }) => {
      await healthHandler({ url });
    });

  return cmd;
}
