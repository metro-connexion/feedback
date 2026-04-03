const BASE_URL = "/api/authentication/cli";

/**
 * Authorize CLI access for the currently authenticated user
 * @param {string} token - The JWT bearer token of the logged-in user
 * @returns {Promise<{ token: string }>} - The generated CLI token
 */
async function authorizeCliLogin(token) {
  const response = await fetch(`${BASE_URL}/authorize`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "CLI authorization failed");
  }
  return { token: data.data.attributes.token };
}

export { authorizeCliLogin };
