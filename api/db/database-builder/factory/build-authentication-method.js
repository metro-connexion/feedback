import { LOGIN_IDENTITY_PROVIDER } from "../../../src/identities-access-management/constants.js";
import { generatePassword } from "../../../src/identities-access-management/services/password-service.js";
import { knex } from "../../knex-database-connection.js";

const PASSWORD = await generatePassword("feedback123");

async function buildAuthenticationMethod({
  identityProvider = LOGIN_IDENTITY_PROVIDER,
  userId,
  hashedPassword = null,
} = {}) {
  if (identityProvider === LOGIN_IDENTITY_PROVIDER) {
    hashedPassword = PASSWORD;
  }
  const [authenticationMethod] = await knex("authentication-methods").insert({
    identityProvider,
    userId,
    hashedPassword,
  }).returning("*");
  return authenticationMethod;
}

export { buildAuthenticationMethod };
