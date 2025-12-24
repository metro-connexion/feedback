import { logger } from "../../logger.js";
import { apiCheck } from "../adapters/api-check.js";

async function healthHandler({ url, oraService = logger.spinner, apiCheckService = apiCheck }) {
  const spinner = oraService("Api checking...");

  const apiRequest = await apiCheckService(url);
  if (apiRequest) {
    spinner.succeed("Api is healthy.");
  } else {
    spinner.fail("Unable to reach the api.");
  }
}

export { healthHandler };
