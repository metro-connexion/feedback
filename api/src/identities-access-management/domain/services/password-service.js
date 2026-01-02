import bcrypt from "bcrypt";

import { config } from "../../../../config.js";
import { logger } from "../../../../logger.js";

const { passwordHash } = config.users;

/**
 * Generates a hashed password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
async function generatePassword(password) {
  try {
    return await bcrypt.hash(password, passwordHash);
  } catch (error) {
    logger.error(`Error generating password hash ${error}`);
    throw error;
  }
}

/**
 * Compares a plain text password with a hashed password
 * @param {string} input - The plain text password to check
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
async function checkPassword(input, hashedPassword) {
  try {
    return await bcrypt.compare(input, hashedPassword);
  } catch (error) {
    logger.error(`Error checking password hash ${error}`);
    throw new error;
  }
}

export { checkPassword, generatePassword };
