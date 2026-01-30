import { beforeEach, describe, expect, it, vi } from "vitest";

import { errorHandler } from "../../../../../src/shared/api/middlewares/error-handler.js";

describe("Unit | Shared | API | Middlewares | Error handler", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe("#errorHandler", () => {
    // Note: Testing celebrate validation errors is better done in integration/acceptance tests
    // as the CelebrateError structure is complex and relies on celebrate's internal implementation

    it("should handle custom errors with statusCode", () => {
      // given
      const customError = new Error("Invalid credentials");
      customError.statusCode = 401;

      // when
      errorHandler(customError, req, res, next);

      // then
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });

    it("should handle errors with 404 status code", () => {
      // given
      const notFoundError = new Error("Resource not found");
      notFoundError.statusCode = 404;

      // when
      errorHandler(notFoundError, req, res, next);

      // then
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Resource not found",
      });
    });

    it("should handle unknown errors with 500 status", () => {
      // given
      const unknownError = new Error("Something went wrong");

      // when
      errorHandler(unknownError, req, res, next);

      // then
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });

    it("should handle errors without message with 500 status", () => {
      // given
      const error = new Error();

      // when
      errorHandler(error, req, res, next);

      // then
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
