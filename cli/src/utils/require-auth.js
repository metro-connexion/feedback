import { logger } from "../../logger.js";
import { getToken } from "./token-storage.js";

/**
 * Ensure the CLI user is authenticated. If not, prints an error message and exits.
 * Use this at the start of any command that requires authentication.
 * @returns {string} - The stored JWT token
 */
function requireAuth() {
  const token = getToken();
  if (!token) {
    logger.error("You must be logged in. Run `feedback-cli login` to authenticate.");
    process.exit(1);
  }
  return token;
}

export { requireAuth };
