import { describe, expect, it } from "vitest";

import { USER_TYPES } from "../../../../src/identities-access-management/constants.js";
import { User } from "../../../../src/identities-access-management/models/user.js";

describe("Unit | Identities Access Management | Models | User", () => {
  it("should return User model with data", () => {
    // given
    const userData = {
      firstname: "John",
      lastname: "Doe",
      email: "john.doe@example.net",
      userType: USER_TYPES.USER,
      isActive: true,
      username: "john2025",
      lastLoggedAt: new Date(),
    };

    // when
    const user = new User(userData);

    // then
    expect(user).toBeInstanceOf(User);
    expect(user.firstname).toBe(userData.firstname);
    expect(user.lastname).toBe(userData.lastname);
    expect(user.email).toBe(userData.email);
    expect(user.userType).toBe(userData.userType);
    expect(user.isActive).toBe(userData.isActive);
    expect(user.username).toBe(userData.username);
    expect(user.lastLoggedAt).toBe(userData.lastLoggedAt);
  });

  describe("#userIsActive", () => {
    it("should return true if user is active", () => {
      // given
      const userData = {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.net",
        userType: USER_TYPES.USER,
        isActive: true,
        username: "john2025",
        lastLoggedAt: new Date(),
      };

      // when
      const user = new User(userData);

      // then
      expect(user.userIsActive).toBe(true);
    });

    it("should return false if user is not active", () => {
      // given
      const userData = {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.net",
        userType: USER_TYPES.USER,
        isActive: false,
        username: "john2025",
        lastLoggedAt: new Date(),
      };

      // when
      const user = new User(userData);

      // then
      expect(user.userIsActive).toBe(false);
    });
  });

  describe("#userIsAdmin", () => {
    it("should return true if user is an admin", () => {
      // given
      const userData = {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.net",
        userType: USER_TYPES.ADMIN,
        isActive: true,
        username: "john2025",
        lastLoggedAt: new Date(),
      };

      // when
      const user = new User(userData);

      // then
      expect(user.userIsAdmin).toBe(true);
    });

    it("should return false if user is not an admin", () => {
      // given
      const userData = {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.net",
        userType: USER_TYPES.USER,
        isActive: true,
        username: "john2025",
        lastLoggedAt: new Date(),
      };

      // when
      const user = new User(userData);

      // then
      expect(user.userIsAdmin).toBe(false);
    });
  });
});
