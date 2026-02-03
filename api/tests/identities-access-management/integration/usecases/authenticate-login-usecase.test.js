import { describe, expect, it } from "vitest";

import { databaseBuilder } from "../../../../db/database-builder/index.js";
import { LOGIN_IDENTITY_PROVIDER } from "../../../../src/identities-access-management/constants.js";
import {
  AuthMethodNotFoundError,
  IncorrectPasswordError, NoLoginAuthMethodError,
  UserNotFoundError,
} from "../../../../src/identities-access-management/domain/errors.js";
import {
  authenticateLoginUsecase,
} from "../../../../src/identities-access-management/usecases/authenticate-login-usecase.js";

describe("Integration | Usecases | Authenticate Login Usecase", () => {
  it("should return the token", async () => {
    // given
    const createdUser = await databaseBuilder.factory.buildUsers();
    await databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: LOGIN_IDENTITY_PROVIDER, password: "feedback123", userId: createdUser.id });

    // when
    const result = await authenticateLoginUsecase({ email: createdUser.email, password: "feedback123" });

    // then
    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("token");
    expect(typeof result.token).toBe("string");
    expect(result).toHaveProperty("userId", createdUser.id);
  });

  describe("error cases", () => {
    it("should throw an user not found if user does not exist", async () => {
      // given
      const email = "john.doe@example.net";
      const password = "feedback123";

      // when
      const resultPromise = authenticateLoginUsecase({ email, password });

      // then
      await expect(resultPromise).rejects.toThrowError(UserNotFoundError);
    });

    it("should throw an incorrect password if password is incorrect", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers();
      await databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: LOGIN_IDENTITY_PROVIDER, password: "feedback123", userId: createdUser.id });
      const incorrectPassword = "wrongpassword";

      // when
      const resultPromise = authenticateLoginUsecase({ email: createdUser.email, password: incorrectPassword });

      // then
      await expect(resultPromise).rejects.toThrowError(IncorrectPasswordError);
    });

    it("should throw a no authentication method found error if login authentication method is not found", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers();
      const password = "feedback123";

      // when
      const resultPromise = authenticateLoginUsecase({ email: createdUser.email, password });

      // then
      await expect(resultPromise).rejects.toThrowError(AuthMethodNotFoundError);
    });

    it("should throw a no login authentication method found error if login authentication method is not found", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers();
      await databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: "oauth", userId: createdUser.id });
      const password = "feedback123";

      // when
      const resultPromise = authenticateLoginUsecase({ email: createdUser.email, password });

      // then
      await expect(resultPromise).rejects.toThrowError(NoLoginAuthMethodError);
    });
  });
});
