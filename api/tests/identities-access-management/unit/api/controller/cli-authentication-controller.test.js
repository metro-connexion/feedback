import { beforeEach, describe, expect, it, vi } from "vitest";

import { authorizeCliLoginController } from "../../../../../src/identities-access-management/api/controllers/cli-authentication-controller.js";

describe("Unit | Identities Access Management | Api | Controllers | CLI Authentication Controller", () => {
  let res, next, usecase;

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    usecase = vi.fn();
  });

  describe("#authorizeCliLoginController", () => {
    it("should return 200 with token on success", async () => {
      // given
      usecase.mockResolvedValue({ token: "cli-jwt-token" });
      const req = { auth: { userId: 42, identityProvider: "login" } };

      // when
      await authorizeCliLoginController(req, res, next, usecase);

      // then
      expect(usecase).toHaveBeenCalledWith({ userId: 42, identityProvider: "login" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          type: "cli-authentication",
          attributes: {
            token: "cli-jwt-token",
          },
        },
      });
    });

    it("should call next with error on failure", async () => {
      // given
      const error = new Error("Token generation failed");
      usecase.mockRejectedValue(error);
      const req = { auth: { userId: 42, identityProvider: "login" } };

      // when
      await authorizeCliLoginController(req, res, next, usecase);

      // then
      expect(usecase).toHaveBeenCalledWith({ userId: 42, identityProvider: "login" });
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
