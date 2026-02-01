import { describe, expect, it } from "vitest";

import {
  ExpiredTokenError,
  InvalidTokenError,
  RequiredTokenError,
  VerificationFailedError,
} from "../../../../src/identities-access-management/domain/errors.js";
import DomainError from "../../../../src/shared/domain/models/domain-error.js";

describe("Unit | Identities Access Management | Domain | Errors", () => {
  describe("#RequiredTokenError", () => {
    it("should create an error with correct message and statusCode", () => {
      // given & when
      const error = new RequiredTokenError();

      // then
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe("Token is required");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("RequiredTokenError");
    });
  });

  describe("#ExpiredTokenError", () => {
    it("should create an error with correct message and statusCode", () => {
      // given & when
      const error = new ExpiredTokenError();

      // then
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe("Token has expired");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("ExpiredTokenError");
    });
  });

  describe("#InvalidTokenError", () => {
    it("should create an error with correct message and statusCode", () => {
      // given & when
      const error = new InvalidTokenError();

      // then
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe("Invalid token");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("InvalidTokenError");
    });
  });

  describe("#VerificationFailedError", () => {
    it("should create an error with correct message and statusCode", () => {
      // given & when
      const error = new VerificationFailedError();

      // then
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe("Token verification failed");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("VerificationFailedError");
    });
  });
});
