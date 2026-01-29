import { LOGIN_IDENTITY_PROVIDER } from "../constants.js";
import {
  AuthMethodNotFoundError,
  IncorrectPasswordError,
  NoLoginAuthMethodError,
  UserNotFoundError,
} from "../domain/errors.js";
import { checkPassword } from "../domain/services/password-service.js";
import { encodedToken } from "../domain/services/token-service.js";
import { findAuthenticationMethodByUserId } from "../infrastructure/repositories/authentication-methods-repository.js";
import { findUserByEmail, updateLastLoggedAtByUserId } from "../infrastructure/repositories/users-repository.js";

/**
 * Authenticate a user with email and password
 * @param {object} params - The parameters
 * @param {string} params.email - The user's email
 * @param {string} params.password - The user's password
 * @returns {Promise<object>} - A promise that resolves to a JWT token if authentication is successful
 */
async function authenticateLoginUsecase({ email, password }) {
  const foundUser = await findUserByEmail(email);
  if (!foundUser) {
    throw new UserNotFoundError();
  }
  const authenticationMethods = await findAuthenticationMethodByUserId(foundUser.id);
  if (!authenticationMethods || authenticationMethods.length === 0) {
    throw new AuthMethodNotFoundError();
  }
  const authenticationMethod = _findLoginAuthenticationMethod(authenticationMethods);
  if (!authenticationMethod) {
    throw new NoLoginAuthMethodError();
  }
  const isPasswordValid = await checkPassword(password, authenticationMethod.hashedPassword);
  if (!isPasswordValid) {
    throw new IncorrectPasswordError();
  }
  await updateLastLoggedAtByUserId(foundUser.id);
  const token = encodedToken({
    userId: foundUser.id,
    identityProvider: LOGIN_IDENTITY_PROVIDER,
  });
  return { success: true, token: token, userId: foundUser.id };
}

/**
 * Return the login authentication method from a list
 * @param {Array} authenticationMethods - The list of authentication methods
 * @returns {AuthenticationMethod|null} - The login authentication method or undefined if not found
 * @private
 */
function _findLoginAuthenticationMethod(authenticationMethods) {
  return authenticationMethods.find((method => method.isLoginIdentityProvider));
}

export { authenticateLoginUsecase };
