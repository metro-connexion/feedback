import { knex } from "../../../db/knex-database-connection.js";
import { DomainTransaction } from "../../shared/infrastructure/DomainTransaction.js";
import { User } from "../domain/models/user.js";

const TABLE_NAME = "users";

/**
 * Create a new user
 * @param {object} user - The user details
 * @param {string} user.firstname - The user's first name
 * @param {string} user.lastname - The user's last name
 * @param {string} user.email - The user's email
 * @param {string} user.username - The user's username
 * @returns {Promise<User|null>} The created user or null if creation failed
 */
async function createUser({ firstname, lastname, email, username }) {
  const knexcon = DomainTransaction.getConnection();
  const [createdUserRow] = await knexcon(TABLE_NAME)
    .insert({
      firstname,
      lastname,
      email,
      username,
    })
    .returning("*");
  return createdUserRow ? new User(createdUserRow) : null;
}

/**
 * Find a user by email
 * @param {string} email - The user's email
 * @returns {Promise<User|null>} - The found user or null if not found
 */
async function findUserByEmail(email) {
  const user = await knex(TABLE_NAME).where({ email }).first();
  return user ? new User(user) : null;
}

/**
 * Find a user with user id
 * @param {number} userId - The user's id
 * @returns {Promise<User|null>} - The found user or null if not found
 */
async function findUserById(userId) {
  const user = await knex(TABLE_NAME).where({ id: userId }).first();
  return user ? new User(user) : null;
}

export { createUser, findUserByEmail, findUserById };
