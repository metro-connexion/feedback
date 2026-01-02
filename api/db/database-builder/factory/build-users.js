import { USER_TYPES } from "../../../src/identities-access-management/constants.js";
import { knex } from "../../knex-database-connection.js";

async function buildUsers({
  firstname = "john",
  lastname = "doe",
  email = "john.doe@example.net",
  username = "john2025",
  userType = USER_TYPES.USER,
  isActive = true,
} = {}) {
  const [user] = await knex("users").insert({
    firstname,
    lastname,
    email,
    username,
    userType,
    isActive,
  }).returning("*");
  return user;
}

export { buildUsers };
