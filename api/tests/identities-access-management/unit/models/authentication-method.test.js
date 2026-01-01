import { describe, expect, it } from "vitest";

import { LOGIN_IDENTITY_PROVIDER } from "../../../../src/identities-access-management/constants.js";
import { AuthenticationMethod } from "../../../../src/identities-access-management/models/authentication-method.js";

describe("Unit | Identities Access Management | Models | Authentication method", () => {
  it("should return instance with data", () => {
    // given
    const data = { id: 123, identityProvider: "provider", userId: 1234, hashedPassword: null };

    // when
    const result = new AuthenticationMethod(data);

    // then
    expect(result).toBeInstanceOf(AuthenticationMethod);
    expect(result.id).toBe(data.id);
    expect(result.identityProvider).toBe(data.identityProvider);
    expect(result.userId).toBe(data.userId);
    expect(result.hashedPassword).toBe(data.hashedPassword);
  });

  describe("#isLoginIdentityProvider", () => {
    it("should return true if identity provider is login", () => {
      // given
      const data = { identityProvider: LOGIN_IDENTITY_PROVIDER, userId: 123, id: 1234, hashedPassword: "abcd" };

      // when
      const result = new AuthenticationMethod(data).isLoginIdentityProvider;

      // then
      expect(result).toBe(true);
    });

    it("should return false if identity provider is not login", () => {
      // given
      const data = { identityProvider: "other-provider", userId: 123, id: 1234, hashedPassword: "abcd" };

      // when
      const result = new AuthenticationMethod(data).isLoginIdentityProvider;

      // then
      expect(result).toBe(false);
    });
  });
});
