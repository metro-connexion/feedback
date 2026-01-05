import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";

import { config } from "../../../../../config.js";
import ERRORS from "../../../../../src/identities-access-management/domain/errors.js";
import { decodedToken, encodedToken } from "../../../../../src/identities-access-management/domain/services/token-service.js";

describe("Integration | Identities Access Management | Domain | Services | Token service", () => {
  describe("#encodedToken", () => {
    it("should return jwt with data", () => {
      // given
      const data = { userId: 1, birthday: "01/01/1970", firstname: "firstname" };

      // when
      const token = encodedToken(data);

      // then
      expect(token).toBeDefined();
      const decodedData = jwt.verify(token, config.jwt.tokenSecret);
      expect(data.userId).toEqual(decodedData.userId);
      expect(data.firstname).toEqual(decodedData.firstname);
      expect(data.birthday).toEqual(decodedData.birthday);
    });

    it("should handle empty object in encodedToken", () => {
      // given
      const data = {};

      // when
      const token = encodedToken(data);

      // then
      expect(token).toBeDefined();
      const decodedData = jwt.verify(token, config.jwt.tokenSecret);
      expect(decodedData).toMatchObject(data);
    });

    it("should handle complex nested object in encodedToken", () => {
      // given
      const data = {
        user: {
          id: 1,
          profile: {
            name: "Test User",
            settings: {
              theme: "dark",
              notifications: true,
            },
          },
        },
        permissions: ["read", "write"],
      };

      // when
      const token = encodedToken(data);

      // then
      expect(token).toBeDefined();
      const decodedData = jwt.verify(token, config.jwt.tokenSecret);
      expect(decodedData.user).toEqual(data.user);
      expect(decodedData.permissions).toEqual(data.permissions);
    });

    describe("error cases", () => {
      it("should handle null data in encodedToken", () => {
        // when & then
        expect(() => encodedToken(null)).toThrow();
      });

      it("should handle undefined data in encodedToken", () => {
        // when & then
        expect(() => encodedToken(undefined)).toThrow();
      });
    });
  });

  describe("#decodedToken", () => {
    it("should return data from token", () => {
      // given
      const data = { userId: 1, birthday: "01/01/1970", firstname: "firstname" };
      const token = jwt.sign(data, config.jwt.tokenSecret, { expiresIn: config.jwt.expirationTime });

      // when
      const decodedData = decodedToken(token);

      // then
      expect(data.userId).toEqual(decodedData.userId);
      expect(data.firstname).toEqual(decodedData.firstname);
      expect(data.birthday).toEqual(decodedData.birthday);
    });

    describe("error cases", () => {
      it(`should throw an ${ERRORS.TOKEN.EXPIRED_TOKEN}`, () => {
        // given
        const data = { userId: 1, birthday: "01/01/1970", firstname: "firstname" };
        const expiredTimestamp = Math.floor(Date.now() / 1000) - 1;
        const token = jwt.sign({ ...data, exp: expiredTimestamp }, config.jwt.tokenSecret);

        // when & then
        expect(() => decodedToken(token)).toThrow(ERRORS.TOKEN.EXPIRED_TOKEN);
      });

      it(`should throw an ${ERRORS.TOKEN.INVALID_TOKEN}`, () => {
        // given
        const invalidToken = "invalid.token.here";

        // when & then
        expect(() => decodedToken(invalidToken)).toThrow(ERRORS.TOKEN.INVALID_TOKEN);
      });

      it(`should throw an ${ERRORS.TOKEN.INVALID_TOKEN} for malformed token`, () => {
        // given
        const malformedToken = "malformed-token-without-dots";

        // when & then
        expect(() => decodedToken(malformedToken)).toThrow(ERRORS.TOKEN.INVALID_TOKEN);
      });

      it(`should throw an ${ERRORS.TOKEN.INVALID_TOKEN} for token with wrong signature`, () => {
        // given
        const data = { userId: 1, firstname: "test" };
        const tokenWithWrongSecret = jwt.sign(data, "wrong-secret", { expiresIn: "1h" });

        // when & then
        expect(() => decodedToken(tokenWithWrongSecret)).toThrow(ERRORS.TOKEN.INVALID_TOKEN);
      });

      it("should handle null token in decodedToken", () => {
        // when & then
        expect(() => decodedToken(null)).toThrow(ERRORS.TOKEN.INVALID_TOKEN);
      });

      it("should handle undefined token in decodedToken", () => {
        // when & then
        expect(() => decodedToken(undefined)).toThrow(ERRORS.TOKEN.INVALID_TOKEN);
      });

      it("should handle empty string token in decodedToken", () => {
        // when & then
        expect(() => decodedToken("")).toThrow(ERRORS.TOKEN.INVALID_TOKEN);
      });
    });
  });
});
