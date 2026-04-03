import { exec } from "node:child_process";

/**
 * Open a URL in the user's default browser.
 * Supports macOS, Windows, and Linux.
 * @param {string} url - The URL to open
 */
function openBrowser(url) {
  const platform = process.platform;
  let command;
  if (platform === "win32") {
    command = `start "" "${url}"`;
  } else if (platform === "darwin") {
    command = `open "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  exec(command);
}

export { openBrowser };
