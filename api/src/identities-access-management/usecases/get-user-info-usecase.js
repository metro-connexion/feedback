import { UserNotFoundError } from "../domain/errors.js";
import { findUserById } from "../infrastructure/repositories/users-repository.js";

async function getUserInfoUsecase(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new UserNotFoundError();
  }
  return { firstname: user.firstname, lastname: user.lastname };
}

export { getUserInfoUsecase };
