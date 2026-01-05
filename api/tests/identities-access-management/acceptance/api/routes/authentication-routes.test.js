import request from "supertest";
import { describe, expect, it } from "vitest";

import { databaseBuilder } from "../../../../../db/database-builder/index.js";
import server from "../../../../../server.js";
import {
  AuthMethodNotFoundError,
  IncorrectPasswordError, NoLoginAuthMethodError,
  UserNotFoundError,
} from "../../../../../src/identities-access-management/domain/errors.js";

describe("Acceptance | Identities Access Management | Api | Routes | Authentication routes", () => {
  describe("POST /api/authentication/authenticate/token", () => {
    it("should return 200 status", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers({ email: "test@example.net" });
      await databaseBuilder.factory.buildAuthenticationMethod({ password: "feedback123", userId: createdUser.id });
      const payload = { email: "test@example.net", password: "feedback123" };

      // when
      const result = await request(server).post("/api/authentication/authenticate/token").send(payload);

      // then
      expect(result.status).toBe(200);
      expect(result.body.data.attributes).toHaveProperty("token");
    });

    it("should return 401 statusif incorrect password", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers({ email: "test@example.net" });
      await databaseBuilder.factory.buildAuthenticationMethod({ password: "feedback123", userId: createdUser.id });
      const payload = { email: "test@example.net", password: "feedback123!" };

      // when
      const result = await request(server).post("/api/authentication/authenticate/token").send(payload);

      // then
      expect(result.status).toBe(401);
      expect(result.body.error).toBe(new IncorrectPasswordError().message);
    });

    it("should return 404 status code if user not found", async () => {
      // given
      const payload = { email: "john.doe@example.net", password: "feedback123" };

      // when
      const result = await request(server).post("/api/authentication/authenticate/token").send(payload);

      // then
      expect(result.status).toBe(404);
      expect(result.body.error).toBe(new UserNotFoundError().message);
    });

    it("should return 404 status if user has no authentication method", async () => {
      // given
      await databaseBuilder.factory.buildUsers({ email: "test@example.net" });
      const payload = { email: "test@example.net", password: "feedback123" };

      // when
      const result = await request(server).post("/api/authentication/authenticate/token").send(payload);

      // then
      expect(result.status).toBe(404);
      expect(result.body.error).toBe(new AuthMethodNotFoundError().message);
    });

    it("should return 400 status if user has no login authentication method", async () => {
      // given
      const createdUser = await databaseBuilder.factory.buildUsers({ email: "test@example.net" });
      await databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: "other", userId: createdUser.id });
      const payload = { email: "test@example.net", password: "feedback123" };

      // when
      const result = await request(server).post("/api/authentication/authenticate/token").send(payload);

      // then
      expect(result.status).toBe(400);
      expect(result.body.error).toBe(new NoLoginAuthMethodError().message);
    });
  });
});
