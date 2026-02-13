import { describe, expect, it } from "vitest";

import { databaseBuilder } from "../../../../../db/database-builder/index.js";
import { knex } from "../../../../../db/knex-database-connection.js";
import { User } from "../../../../../src/identities-access-management/domain/models/user.js";
import * as usersRepository from "../../../../../src/identities-access-management/infrastructure/repositories/users-repository.js";

describe("Integration | Identities Access Management | Infrastructure | Repositories | Users repository", () => {
  describe("#createUser", () => {
    it("should create user successfull", async () => {
      // given
      const userData = {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.net",
        username: "john2025",
      };

      // when
      const result = await usersRepository.createUser(userData);

      // then
      expect(result).toBeInstanceOf(User);
      const createdUser = await knex("users").where({ email: userData.email });
      expect(createdUser).toHaveLength(1);
      expect(createdUser[0]).toMatchObject(userData);
      expect(result.id).toEqual(createdUser[0].id);
    });

    it("should not create user with email already in database", async () => {
      // given
      const existingUser = await databaseBuilder.factory.buildUsers();

      const userData = {
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        email: existingUser.email,
        username: "newusername2025",
      };

      // when
      const result = await usersRepository.createUser(userData).catch(e => e);

      // then
      expect(result).toBeInstanceOf(Error);
    });

    it("should not create user when username is already in database", async () => {
      // given
      const existingUser = await databaseBuilder.factory.buildUsers();

      const userData = {
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        email: "newemail@example.net",
        username: existingUser.username,
      };

      // when
      const result = await usersRepository.createUser(userData).catch(e => e);

      // then
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("#findUserByEmail", () => {
    it("should return User instance with user data", async () => {
      // given
      const existingUser = await databaseBuilder.factory.buildUsers();

      // when
      const foundUser = await usersRepository.findUserByEmail(existingUser.email);

      // then
      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser.firstname).toEqual(existingUser.firstname);
      expect(foundUser.lastname).toEqual(existingUser.lastname);
      expect(foundUser.email).toEqual(existingUser.email);
      expect(foundUser.username).toEqual(existingUser.username);
    });

    it("should return null if user not found", async () => {
      // given
      const nonExistentEmail = "no-existing@example.net";

      // when
      const foundUser = await usersRepository.findUserByEmail(nonExistentEmail);

      // then
      expect(foundUser).toBeNull();
    });
  });

  describe("#findUserById", () => {
    it("should return User instance with user data", async () => {
      // given
      const existingUser = await databaseBuilder.factory.buildUsers();

      // when
      const foundUser = await usersRepository.findUserById(existingUser.id);

      // then
      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser.firstname).toEqual(existingUser.firstname);
      expect(foundUser.lastname).toEqual(existingUser.lastname);
      expect(foundUser.email).toEqual(existingUser.email);
      expect(foundUser.username).toEqual(existingUser.username);
    });

    it("should return null if user does not exist", async () => {
      // given
      const nonExistentUserId = 99999;

      // when
      const foundUser = await usersRepository.findUserById(nonExistentUserId);

      // then
      expect(foundUser).toBeNull();
    });
  });

  describe("#updateLastLoggedAtByUserId", () => {
    it("should update the lastLoggedAt column", async () => {
      // given
      const user = await databaseBuilder.factory.buildUsers({ lastLoggedAt: null });

      // when
      const result = await usersRepository.updateLastLoggedAtByUserId(user.id);

      // then
      const updatedUserRow = await knex("users").where({ id: user.id }).first();
      expect(updatedUserRow.last_logged_at).not.toBeNull();
      expect(updatedUserRow.lastLoggedAt).toBeInstanceOf(Date);
      expect(updatedUserRow.lastLoggedAt).toEqual(result);
      expect(updatedUserRow.updatedAt).not.toBe(user.updatedAt);
    });

    it("should throw error if user not found", async () => {
      // given
      const nonExistentUserId = 99999;

      // when
      const result = await usersRepository.updateLastLoggedAtByUserId(nonExistentUserId).catch(e => e);

      // then
      expect(result).toBeInstanceOf(Error);
    });
  });
});
