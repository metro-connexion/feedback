import { LOGIN_IDENTITY_PROVIDER } from "../../constants.js";

/**
 * Represents an authentication method for a user.
 * @class AuthenticationMethod
 * @property {number} id - The unique identifier for the authentication method.
 * @property {string} identityProvider - The identity provider (e.g., 'login', 'google', etc.).
 * @property {number} userId - The identifier of the user associated with this authentication method.
 * @property {string|null} hashedPassword - The hashed password (if applicable).
 */
class AuthenticationMethod {
  constructor({ id, identityProvider, userId, hashedPassword }) {
    this.id = id;
    this.identityProvider = identityProvider;
    this.userId = userId;
    this.hashedPassword = hashedPassword;
  }

  get isLoginIdentityProvider() {
    return this.identityProvider === LOGIN_IDENTITY_PROVIDER;
  }
}

export { AuthenticationMethod };
