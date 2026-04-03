import { encodedToken } from "../domain/services/token-service.js";

/**
 * Generate a JWT token for CLI authentication
 * @param {object} params - The parameters
 * @param {number} params.userId - The user ID
 * @param {string} params.identityProvider - The identity provider used to authenticate
 * @param {Function} [tokenService] - The token encoding service (optional)
 * @returns {Promise<{ token: string }>} - The generated CLI token
 */
async function generateCliTokenUsecase({ userId, identityProvider }, tokenService = encodedToken) {
  const token = tokenService({ userId, identityProvider });
  return { token };
}

export { generateCliTokenUsecase };
