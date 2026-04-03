import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".feedback");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

/**
 * Read the CLI configuration file
 * @returns {object} - The parsed configuration object, or an empty object if not found
 */
function readConfig() {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return {};
  }
}

/**
 * Write the CLI configuration file
 * @param {object} config - The configuration object to persist
 */
function writeConfig(config) {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
}

/**
 * Get the stored authentication token
 * @returns {string|null} - The stored token, or null if not found
 */
function getToken() {
  return readConfig().token || null;
}

/**
 * Store the authentication token
 * @param {string} token - The JWT token to store
 */
function setToken(token) {
  const config = readConfig();
  config.token = token;
  writeConfig(config);
}

/**
 * Remove the stored authentication token
 */
function clearToken() {
  const config = readConfig();
  if (!Object.prototype.hasOwnProperty.call(config, "token")) return;
  delete config.token;
  writeConfig(config);
}

export { clearToken, getToken, setToken };
