import request from "supertest";
import { describe, expect, it } from "vitest";

import { databaseBuilder } from "../../../../../db/database-builder/index.js";
import server from "../../../../../server.js";
import { generateAuthenticate } from "../../../../helpers/generate-authenticate.js";

describe("Acceptance | Identities Access Management | Api | Routes | user route", () => {
  describe("GET /api/user", () => {
    it("should return 200 http status code and user information", async () => {
      // given
      const user = await databaseBuilder.factory.buildUsers();
      const authenticationMethod = await databaseBuilder.factory.buildAuthenticationMethod({ userId: user.id });
      const token = await generateAuthenticate({ userId: user.id, identityProvider: authenticationMethod.identityProvider });

      // when
      const response = await request(server).get("/api/user").set("Authorization", `Bearer ${token}`);

      // then
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          firstname: user.firstname,
          lastname: user.lastname,
        },
      });
    });

    it("should return a 404 http status code if user does not exist", async () => {
      // given
      const token = await generateAuthenticate({ userId: 123, identityProvider: null, skipLastLoggedAt: true });

      // when
      const response = await request(server).get("/api/user").set("Authorization", `Bearer ${token}`);

      // then
      expect(response.status).toBe(404);
    });
  });
});
