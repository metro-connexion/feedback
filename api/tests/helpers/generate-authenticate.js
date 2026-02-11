import { encodedToken } from "../../src/identities-access-management/domain/services/token-service.js";
import {
  updateLastLoggedAtByUserId,
} from "../../src/identities-access-management/infrastructure/repositories/users-repository.js";

async function generateAuthenticate({ userId, identityProvider, skipLastLoggedAt = false }) {
  if (!skipLastLoggedAt) {
    await updateLastLoggedAtByUserId(userId);
  }
  const token = encodedToken({ userId: userId, identityProvider: identityProvider });
  return token;
}

export { generateAuthenticate };
