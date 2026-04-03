import request from "supertest";
import { describe, expect, it } from "vitest";

import { databaseBuilder } from "../../../../../db/database-builder/index.js";
import server from "../../../../../server.js";
import { generateAuthenticate } from "../../../../helpers/generate-authenticate.js";

describe("Acceptance | Identities Access Management | Api | Routes | CLI authentication routes", () => {
  describe("POST /api/authentication/cli/authorize", () => {
    it("should return 200 with a CLI token when user is authenticated", async () => {
      // given
      const user = await databaseBuilder.factory.buildUsers();
      const authenticationMethod = await databaseBuilder.factory.buildAuthenticationMethod({ userId: user.id });
      const token = await generateAuthenticate({ userId: user.id, identityProvider: authenticationMethod.identityProvider });

      // when
      const response = await request(server)
        .post("/api/authentication/cli/authorize")
        .set("Authorization", `Bearer ${token}`);

      // then
      expect(response.status).toBe(200);
      expect(response.body.data.type).toBe("cli-authentication");
      expect(response.body.data.attributes).toHaveProperty("token");
    });

    it("should return 401 when no token is provided", async () => {
      // when
      const response = await request(server).post("/api/authentication/cli/authorize");

      // then
      expect(response.status).toBe(401);
    });

    it("should return 401 when an invalid token is provided", async () => {
      // when
      const response = await request(server)
        .post("/api/authentication/cli/authorize")
        .set("Authorization", "Bearer invalid-token");

      // then
      expect(response.status).toBe(401);
    });
  });
});
