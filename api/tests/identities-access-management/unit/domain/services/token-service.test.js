import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";

import ERRORS from "../../../../../src/identities-access-management/domain/errors.js";
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
    it(`should throw an ${ERRORS.TOKEN.VERIFICATION_FAILED} for generic error`, () => {
      // given
      vi.spyOn(jwt, "verify").mockImplementation(() => {
        const error = new Error("Generic error");
        error.name = "GenericError";
        throw error;
      });

      // when & then
      expect(() => decodedToken("any-token")).toThrow(ERRORS.TOKEN.VERIFICATION_FAILED);
    });
  });
});
