import { describe, expect, it } from "vitest";

import { databaseBuilder } from "../../../../../db/database-builder/index.js";
import { knex } from "../../../../../db/knex-database-connection.js";
import { LOGIN_IDENTITY_PROVIDER } from "../../../../../src/identities-access-management/constants.js";
import { AuthenticationMethod } from "../../../../../src/identities-access-management/domain/models/authentication-method.js";
import * as authenticationMethodsRepository from "../../../../../src/identities-access-management/infrastructure/repositories/authentication-methods-repository.js";

describe("Integration | Identities Access Management | Infrastructure | Repositories | Authentication methods repository", () => {
  describe("#addNewAuthenticationMethod", () => {
    it("should add the authentication method for an user", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers();
      const authenticationMethodData = {
        userId: createdUser.id,
        identityProvider: LOGIN_IDENTITY_PROVIDER,
        hashedPassword: "abc123",
      };

      // when
      const result = await authenticationMethodsRepository.addNewAuthenticationMethod(authenticationMethodData);

      // then
      expect(result).toBeInstanceOf(AuthenticationMethod);
      const foundAuthenticationMethod = await knex("authentication-methods").where({ id: result.id });
      expect(foundAuthenticationMethod).toHaveLength(1);
      expect(foundAuthenticationMethod[0]).toMatchObject(authenticationMethodData);
    });

    it("should throw an error if userId and identityProvider already exist", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers();
      const createdAuthenticationMethod = await databaseBuilder.factory.buildAuthenticationMethod({ userId: createdUser.id });
      const authenticationMethodData = {
        userId: createdUser.id,
        identityProvider: createdAuthenticationMethod.identityProvider,
        hashedPassword: createdAuthenticationMethod.hashedPassword,
      };

      // when
      const result = await authenticationMethodsRepository.addNewAuthenticationMethod(authenticationMethodData).catch(e => e);

      // then
      expect(result).toBeInstanceOf(Error);
    });

    it("should throw an error if user id does not exist", async () => {
      // given
      const userId = 123;
      const authenticationMethodData = {
        userId,
        identityProvider: LOGIN_IDENTITY_PROVIDER,
        hashedPassword: "abc123",
      };

      // when
      const result = await authenticationMethodsRepository.addNewAuthenticationMethod(authenticationMethodData).catch(e => e);

      // then
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("#findAuthenticationMethodByUserId", () => {
    it("should return Array of AuthenticationMethodInstance with data", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers();
      await databaseBuilder.factory.buildAuthenticationMethod({ userId: createdUser.id, identityProvider: "oidc-identity-provider" });
      await databaseBuilder.factory.buildAuthenticationMethod({ userId: createdUser.id, identityProvider: LOGIN_IDENTITY_PROVIDER });

      // when
      const result = await authenticationMethodsRepository.findAuthenticationMethodByUserId(createdUser.id);

      // then
      expect(result).toHaveLength(2);
      const someAuthenticationMethods = await knex("authentication-methods").where({ userId: createdUser.id }).orderBy("id", "asc");
      result.map((data, index) => {
        expect(data).toBeInstanceOf(AuthenticationMethod);
        expect(data.id).toEqual(someAuthenticationMethods[index].id);
      });
    });

    it("should return null if user has no authentication methods", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers();

      // when
      const result = await authenticationMethodsRepository.findAuthenticationMethodByUserId(createdUser.id);

      // then
      expect(result).toBeNull();
    });

    it("should return null if user does not exist", async () => {
      // given
      const userId = 123;

      // when
      const result = await authenticationMethodsRepository.findAuthenticationMethodByUserId(userId);

      // then
      expect(result).toBeNull();
    });
  });
});
