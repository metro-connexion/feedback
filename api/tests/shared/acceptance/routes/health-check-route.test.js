import request from "supertest";
import { describe, expect, it } from "vitest";

import server from "../../../../server.js";

describe("Acceptance | Shared | Routes |  Health Check", () => {
  describe("GET /api/health", () => {
    it("should return 200 http status and message", async () => {
      // given
      const path = "/api/health";
      const message = "api is ok!";

      // when
      const result = await request(server).get(path);

      // then
      expect(result.status).toBe(200);
      expect(result.text).toEqual(message);
    });
  });
});
