const BASE_URL = "/api/authentication";

/**
 * Authenticate a user with email and password
 * @param {Object} credentials - The user credentials
 * @param {string} credentials.email - The user's email
 * @param {string} credentials.password - The user's password
 * @returns {Promise<{ token: string, userId: number }>} - The auth token and user ID
 */
async function authenticate({ email, password }) {
  const response = await fetch(`${BASE_URL}/authenticate/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Authentication failed");
  }
  return {
    token: data.data.attributes.token,
    userId: data.data.userId,
  };
}

export { authenticate };
