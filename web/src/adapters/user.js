const BASE_URL = "/api/user";

/**
 * Fetch the authenticated user's information
 * @param {string} token - The JWT bearer token
 * @returns {Promise<{ firstname: string, lastname: string }>} - The user's first and last name
 */
async function getUser(token) {
  const response = await fetch(BASE_URL, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch user");
  }
  return {
    firstname: data.data.firstname,
    lastname: data.data.lastname,
  };
}

export { getUser };
