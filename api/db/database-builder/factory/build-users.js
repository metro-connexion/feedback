import { USER_TYPES } from "../../../src/identities-access-management/constants.js";
import { knex } from "../../knex-database-connection.js";

async function buildUsers({
  firstname = "john",
  lastname = "doe",
  email = "john.doe@example.net",
  username = "john2025",
  userType = USER_TYPES.USER,
  isActive = true,
  lastLoggedAt = new Date("2023-01-01T00:00:00Z"),
} = {}) {
  const [user] = await knex("users").insert({
    firstname,
    lastname,
    email,
    username,
    userType,
    isActive,
    lastLoggedAt,
  }).returning("*");
  return user;
}

export { buildUsers };
