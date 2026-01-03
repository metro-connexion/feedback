import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { marked } from "marked";

import { logger } from "../../../../../logger.js";

const MAIL_FOLDER = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../../email-templates",
);
const FOOTER_FILE_NAME = "footer.md";

/**
 * Escapes special characters in a string to be used in a regular expression.
 * @param {string} string - The string to escape
 * @returns {string} The escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Map of HTML special characters to their escaped equivalents
 */
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
};

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * The regex replacement ensures each character is only escaped once,
 * preventing double-escaping issues.
 * @param {string} text - The text to escape
 * @returns {string} The escaped text safe for HTML insertion
 */
function escapeHtml(text) {
  if (text === null || text === undefined) {
    return "";
  }
  const stringValue = String(text);
  return stringValue.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

/**
 * Creates the mail body by reading a markdown file and replacing placeholders with provided values.
 * @param {string} documentName - Name of the markdown file (without extension) to read from the email-templates folder
 * @param {object} replaceElements - An object containing key-value pairs where keys are placeholders in the markdown file (enclosed in {{}}) and values are the strings to replace them with
 * @returns {Promise<string>} The processed markdown converted to HTML
 */
async function createMailBodyService(documentName, replaceElements) {
  try {
    const documentPath = path.join(MAIL_FOLDER, `${documentName}.md`);
    const footerPath = path.join(MAIL_FOLDER, FOOTER_FILE_NAME);

    const [documentBody, footerBody] = await Promise.all([
      fs.readFile(documentPath, "utf8"),
      fs.readFile(footerPath, "utf8"),
    ]);

    let mailBody = documentBody;

    if (replaceElements) {
      for (const [key, value] of Object.entries(replaceElements)) {
        const placeholder = `{{${key}}}`;
        const sanitizedValue = escapeHtml(value);
        mailBody = mailBody.replace(new RegExp(escapeRegExp(placeholder), "g"), sanitizedValue);
      }
    }

    mailBody += footerBody;
    return marked(mailBody);
  } catch (error) {
    logger.error("Error creating mail body", error);
    throw error;
  }
}

export { createMailBodyService };
