import { USER_TYPES } from "../constants.js";

/**
 * User domain model
 * @class User
 * @property {number} id - The unique identifier of the user
 * @property {string} firstname - The first name of the user
 * @property {string} lastname - The last name of the user
 * @property {string} email - The email of the user
 * @property {string} username - The username of the user
 * @property {Date} lastLoggedAt - The last login date of the user
 * @property {string} userType - The type of the user (e.g., admin, regular)
 * @property {boolean} isActive - Whether the user is active or not
 */
class User {
  constructor({ id, firstname, lastname, email, username, lastLoggedAt, userType, isActive }) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.username = username;
    this.lastLoggedAt = lastLoggedAt;
    this.userType = userType;
    this.isActive = isActive;
  }

  get userIsActive() {
    return this.isActive;
  }

  get userIsAdmin() {
    return this.userType === USER_TYPES.ADMIN;
  }
}

export { User };
