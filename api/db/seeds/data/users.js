import { LOGIN_IDENTITY_PROVIDER } from "../../../src/identities-access-management/constants.js";
import { databaseBuilder } from "../../database-builder/index.js";

const DEFAULT_PASSWORD = "feedback123";
async function createBasicUser() {
  const user = await databaseBuilder.factory.buildUsers({
    firstname: "Simple",
    lastname: "User",
    username: "simpleuser",
    email: "simple.user@example.net",
    isActive: true,
  });
  await databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: LOGIN_IDENTITY_PROVIDER, password: DEFAULT_PASSWORD, userId: user.id });
}

async function createNotActiveUser() {
  const user = await databaseBuilder.factory.buildUsers({
    firstname: "NotActive",
    lastname: "User",
    username: "notactiveuser",
    email: "notactive.user@example.net",
    isActive: false,
  });
  await databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: LOGIN_IDENTITY_PROVIDER, password: DEFAULT_PASSWORD, userId: user.id });
}

export { createBasicUser, createNotActiveUser };
