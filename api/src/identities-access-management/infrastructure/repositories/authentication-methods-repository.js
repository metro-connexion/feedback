import { knex } from "../../../../db/knex-database-connection.js";
import { DomainTransaction } from "../../../shared/infrastructure/DomainTransaction.js";
import { AuthenticationMethod } from "../../domain/models/authentication-method.js";

const TABLE_NAME = "authentication-methods";

/**
 * Add a new authentication method for a specific user
 * @param {object} authenticationMethod - The authentication method details
 * @param {number} authenticationMethod.userId - The ID of the user
 * @param {string} authenticationMethod.identityProvider - The identity provider (e.g., 'login', 'google', 'facebook')
 * @param {string} authenticationMethod.hashedPassword - The hashed password (if applicable)
 * @returns {Promise<AuthenticationMethod>} - The newly created authentication method
 */
async function addNewAuthenticationMethod({ userId, identityProvider, hashedPassword = null }) {
  const knexcon = DomainTransaction.getConnection();
  const [authenticationMethod] = await knexcon(TABLE_NAME)
    .insert({
      userId,
      identityProvider,
      hashedPassword,
    })
    .returning("*");
  return new AuthenticationMethod(authenticationMethod);
}

/**
 * Find authentication methods by user ID
 * @param {number} userId - The ID of the user
 * @returns {Promise<Array|null>} - An array of AuthenticationMethod instances or null if none found
 */
async function findAuthenticationMethodByUserId(userId) {
  const foundAuthenticationMethods = await knex(TABLE_NAME).where({ userId }).orderBy("id", "asc");
  if (foundAuthenticationMethods.length) {
    return foundAuthenticationMethods.map(authenticationMethodData => new AuthenticationMethod(authenticationMethodData));
  }
  return null;
}

export { addNewAuthenticationMethod, findAuthenticationMethodByUserId };
