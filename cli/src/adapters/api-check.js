const API_ENDPOINT = "/api/health";

/**
 * Checks if the API at the given URL is reachable.
 * @param {string} url - The base URL of the API to check.
 * @returns {Promise<boolean>} - True if the API is reachable, false otherwise.
 */
async function apiCheck(url) {
  try {
    const response = await fetch(`${url}${API_ENDPOINT}`);
    return response.status === 200;
  } catch {
    return false;
  }
}

export { apiCheck };
