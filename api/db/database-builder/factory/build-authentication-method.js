import { LOGIN_IDENTITY_PROVIDER } from "../../../src/identities-access-management/constants.js";
import { generatePassword } from "../../../src/identities-access-management/domain/services/password-service.js";
import { knex } from "../../knex-database-connection.js";

let passwordPromise;

async function getDefaultPassword() {
  if (!passwordPromise) {
    passwordPromise = generatePassword("feedback123");
  }
  return passwordPromise;
}

async function buildAuthenticationMethod({
  identityProvider = LOGIN_IDENTITY_PROVIDER,
  userId,
  hashedPassword = null,
  password = null,
} = {}) {
  if (identityProvider === LOGIN_IDENTITY_PROVIDER) {
    if (password) {
      hashedPassword = await generatePassword(password);
    } else {
      hashedPassword = await getDefaultPassword();
    }
  }
  const [authenticationMethod] = await knex("authentication-methods").insert({
    identityProvider,
    userId,
    hashedPassword,
  }).returning("*");
  return authenticationMethod;
}

export { buildAuthenticationMethod };
