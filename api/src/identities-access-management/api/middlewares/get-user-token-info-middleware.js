import { RequiredTokenError } from "../../domain/errors.js";
import { decodedToken } from "../../domain/services/token-service.js";

/**
 * This middleware extracts the user information from the JWT token in the Authorization header and attaches it to the request object. If the token is missing or invalid, it throws an error.
 * @param {object} req - The Express request object
 * @param {object} res - The Express response object
 * @param {Function} next - The Express next middleware function
 * @param {Function} decodedTokenService - The service function to decode the JWT token (optional, defaults to the imported decodedToken function)
 * @returns {void} - This function does not return anything, it either calls next() to proceed to the next middleware or throws an error if the token is missing or invalid.
 */
function getUserTokenInfoMiddleware(req, res, next, decodedTokenService = decodedToken) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new RequiredTokenError();
    }
    const decoded = decodedTokenService(token);
    req.auth = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

export { getUserTokenInfoMiddleware };
