import { config } from "./config.js";
import { logger } from "./logger.js";
import server from "./server.js";

const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`);
});
