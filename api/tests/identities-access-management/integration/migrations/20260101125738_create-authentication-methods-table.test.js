import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { knex } from "../../../../db/knex-database-connection.js";
import { down, up } from "../../../../db/migrations/20260101125738_create-authentication-methods-table.js";

describe("Integration | Identities Access Management | Migrations | Create authentication-methods table", () => {
  const TABLE_NAME = "authentication-methods";

  beforeEach(async () => {
    // given - ensure table does not exist before each test
    const tableExists = await knex.schema.hasTable(TABLE_NAME);
    if (tableExists) {
      await down(knex);
    }
  });

  afterEach(async () => {
    // Clean up - ensure table is dropped after each test
    const tableExists = await knex.schema.hasTable(TABLE_NAME);
    if (tableExists) {
      await down(knex);
    }
  });

  describe("#up", () => {
    it("should create the authentication-methods table with correct schema", async () => {
      // given
      const tableExistsBefore = await knex.schema.hasTable(TABLE_NAME);
      expect(tableExistsBefore).toBe(false);

      // when
      await up(knex);

      // then
      const tableExistsAfter = await knex.schema.hasTable(TABLE_NAME);
      expect(tableExistsAfter).toBe(true);

      const tableInfo = await knex(TABLE_NAME).columnInfo();
      expect(tableInfo.id).toBeDefined();
      expect(tableInfo.userId).toBeDefined();
      expect(tableInfo.identityProvider).toBeDefined();
      expect(tableInfo.hashedPassword).toBeDefined();
      expect(tableInfo.created_at).toBeDefined();
      expect(tableInfo.updated_at).toBeDefined();
    });

    it("should create the authentication-methods table with correct column types", async () => {
      // given - table does not exist

      // when
      await up(knex);

      // then
      const tableInfo = await knex(TABLE_NAME).columnInfo();
      expect(tableInfo.id.type).toBe("integer");
      expect(tableInfo.userId.type).toBe("integer");
      expect(tableInfo.identityProvider.type).toBe("character varying");
      expect(tableInfo.hashedPassword.type).toBe("character varying");
      expect(tableInfo.created_at.type).toBe("timestamp with time zone");
      expect(tableInfo.updated_at.type).toBe("timestamp with time zone");
    });

    it("should set userId as not nullable", async () => {
      // given - table does not exist

      // when
      await up(knex);

      // then
      const tableInfo = await knex(TABLE_NAME).columnInfo();
      expect(tableInfo.userId.nullable).toBe(false);
    });

    it("should set hashedPassword as nullable with default null", async () => {
      // given - table does not exist

      // when
      await up(knex);

      // then
      const tableInfo = await knex(TABLE_NAME).columnInfo();
      expect(tableInfo.hashedPassword.nullable).toBe(true);
      expect(tableInfo.hashedPassword.defaultValue).toBe("NULL::character varying");
    });

    it("should create a unique constraint on userId and identityProvider", async () => {
      // given
      await up(knex);
      await knex("users").insert({ firstname: "John", lastname: "Doe", username: "johndoe", email: "john@example.com" });
      const user = await knex("users").where({ email: "john@example.com" }).first();

      await knex(TABLE_NAME).insert({
        userId: user.id,
        identityProvider: "login",
        hashedPassword: "hash123",
      });

      // when
      const insertDuplicate = knex(TABLE_NAME).insert({
        userId: user.id,
        identityProvider: "login",
        hashedPassword: "hash456",
      });

      // then
      await expect(insertDuplicate).rejects.toThrow();
    });

    it("should allow multiple authentication methods for same user with different identity providers", async () => {
      // given
      await up(knex);
      await knex("users").insert({ firstname: "Jane", lastname: "Smith", username: "janesmith", email: "jane@example.com" });
      const user = await knex("users").where({ email: "jane@example.com" }).first();

      // when
      await knex(TABLE_NAME).insert({
        userId: user.id,
        identityProvider: "login",
        hashedPassword: "hash123",
      });
      await knex(TABLE_NAME).insert({
        userId: user.id,
        identityProvider: "google",
        hashedPassword: null,
      });

      // then
      const authMethods = await knex(TABLE_NAME).where({ userId: user.id });
      expect(authMethods).toHaveLength(2);
    });

    it("should enforce foreign key constraint on userId referencing users table", async () => {
      // given
      await up(knex);
      const NON_EXISTENT_USER_ID = 99999;

      // when
      const insertInvalidUser = knex(TABLE_NAME).insert({
        userId: NON_EXISTENT_USER_ID,
        identityProvider: "login",
        hashedPassword: "hash123",
      });

      // then
      await expect(insertInvalidUser).rejects.toThrow();
    });

    it("should delete authentication methods when referenced user is deleted (CASCADE)", async () => {
      // given
      await up(knex);
      await knex("users").insert({ firstname: "Bob", lastname: "Brown", username: "bobbrown", email: "bob@example.com" });
      const user = await knex("users").where({ email: "bob@example.com" }).first();
      await knex(TABLE_NAME).insert({
        userId: user.id,
        identityProvider: "login",
        hashedPassword: "hash123",
      });

      const authMethodsBefore = await knex(TABLE_NAME).where({ userId: user.id });
      expect(authMethodsBefore).toHaveLength(1);

      // when
      await knex("users").where({ id: user.id }).delete();

      // then
      const authMethodsAfter = await knex(TABLE_NAME).where({ userId: user.id });
      expect(authMethodsAfter).toHaveLength(0);
    });
  });

  describe("#down", () => {
    it("should drop the authentication-methods table", async () => {
      // given
      await up(knex);
      const tableExistsBefore = await knex.schema.hasTable(TABLE_NAME);
      expect(tableExistsBefore).toBe(true);

      // when
      await down(knex);

      // then
      const tableExistsAfter = await knex.schema.hasTable(TABLE_NAME);
      expect(tableExistsAfter).toBe(false);
    });
  });
});
