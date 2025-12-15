import process from "node:process";

import { logger } from "../logger.js";
import { disconnect, emptyAllTablesOfDatabase } from "./knex-database-connection.js";

async function main() {
  logger.info("Emptying all tables...");
  await emptyAllTablesOfDatabase();
  logger.info("Done!");
}

(async () => {
  try {
    await main();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  } finally {
    await disconnect();
  }
})();
