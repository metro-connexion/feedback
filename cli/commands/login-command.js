import { Command } from "commander";

import { logger } from "../logger.js";
import { loginHandler } from "../src/handlers/login-handler.js";

/**
 * Create the `login` CLI command.
 * Opens a browser window so the user can authenticate via the web interface.
 * The resulting token is stored locally for subsequent authenticated commands.
 * @returns {Command} - The configured Commander command
 */
export function createLoginCommand() {
  const cmd = new Command("login")
    .description("Authenticate with the Feedback platform via your browser")
    .option("-u, --url <url>", "Web application URL", "http://localhost:5173")
    .action(async ({ url }) => {
      await loginHandler({ url, oraService: logger.spinner });
    });

  return cmd;
}
