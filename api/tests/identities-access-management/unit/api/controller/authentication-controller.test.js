import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  authenticateWithLogin,
} from "../../../../../src/identities-access-management/api/controllers/authentication-controller.js";

describe("Unit | Controller | Authentication Controller", () => {
  let res;
  const next = vi.fn();

  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
  });

  describe("#authenticateWithLogin", () => {
    const loginUsecase = vi.fn();

    it("should call loginUsecase and return 200 http status if success", async () => {
      // given
      const req = {
        body: { email: "john.doe@example.net", password: "password123" },
      };
      const userData = {
        success: true,
        userId: 123,
        token: "ThisIsATestToken",
      };
      loginUsecase.mockResolvedValue(userData);

      // when
      await authenticateWithLogin(req, res, next, loginUsecase);

      // then
      expect(loginUsecase).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          type: "authentication",
          userId: userData.userId,
          attributes: {
            token: userData.token,
          },
        },
      });
    });

    it("should call next with error param if an error occurred", async () => {
      // given
      const req = {
        body: {
          email: "john.doe@example.net",
          password: "password123",
        },
      };
      const error = new Error("An error occurred");
      loginUsecase.mockRejectedValue(error);

      // when
      await authenticateWithLogin(req, res, next, loginUsecase);

      // then
      expect(loginUsecase).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
