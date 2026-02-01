import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";

import {
  ExpiredTokenError,
  InvalidTokenError,
  VerificationFailedError,
} from "../../../../../src/identities-access-management/domain/errors.js";
import { decodedToken, encodedToken } from "../../../../../src/identities-access-management/domain/services/token-service.js";

describe("Unit | Identities Access Management | Domain | Services | Token service", () => {
  describe("#encodedToken", () => {
    it("should throw an error if an error occurred", () => {
      // given
      vi.spyOn(jwt, "sign").mockImplementation(() => { throw new Error("Signing error"); });
      // when & then
      expect(() => encodedToken({ userId: 1 })).toThrow("Signing error");
    });
  });

  describe("#decodedToken", () => {
    it("should throw a VerificationFailedError for generic error", () => {
      // given
      vi.spyOn(jwt, "verify").mockImplementation(() => {
        const error = new Error("Generic error");
        error.name = "GenericError";
        throw error;
      });

      // when & then
      expect(() => decodedToken("any-token")).toThrow(VerificationFailedError);
      expect(() => decodedToken("any-token")).toThrow("Token verification failed");
    });

    it("should throw an ExpiredTokenError when token is expired", () => {
      // given
      vi.spyOn(jwt, "verify").mockImplementation(() => {
        const error = new Error("Token expired");
        error.name = "TokenExpiredError";
        throw error;
      });

      // when & then
      expect(() => decodedToken("expired-token")).toThrow(ExpiredTokenError);
      expect(() => decodedToken("expired-token")).toThrow("Token has expired");
    });

    it("should throw an InvalidTokenError for malformed token", () => {
      // given
      vi.spyOn(jwt, "verify").mockImplementation(() => {
        const error = new Error("Invalid token");
        error.name = "JsonWebTokenError";
        throw error;
      });

      // when & then
      expect(() => decodedToken("invalid-token")).toThrow(InvalidTokenError);
      expect(() => decodedToken("invalid-token")).toThrow("Invalid token");
    });
  });
});
