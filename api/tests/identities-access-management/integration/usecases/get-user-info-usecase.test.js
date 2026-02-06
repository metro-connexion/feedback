import { describe, expect, it } from "vitest";

import { databaseBuilder } from "../../../../db/database-builder/index.js";
import { UserNotFoundError } from "../../../../src/identities-access-management/domain/errors.js";
import { getUserInfoUsecase } from "../../../../src/identities-access-management/usecases/get-user-info-usecase.js";

describe("Integration | Identities Access Management | Usecases | Get user info usecase", () => {
  it("should return firstname lastname of user", async () => {
    // given
    const user = await databaseBuilder.factory.buildUsers();

    // when
    const result = await getUserInfoUsecase(user.id);

    // then
    expect(result).toEqual({ firstname: user.firstname, lastname: user.lastname });
  });

  it("should throw a not found error if user does not exist", async () => {
    // given
    const userId = 123;

    // when
    const result = getUserInfoUsecase(userId);

    // then
    await expect(result).rejects.toThrowError(UserNotFoundError);
  });
});
