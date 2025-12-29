import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it } from "vitest";

import { config } from "../../../../config.js";

describe("Integration | Identities Access Management | Services | Password service", () => {
  beforeEach(() => {
    config.users.passwordHash = 10;
  });

  describe("checkPassword", () => {
    it("should return true if passwords are same", async () => {
      // given
      const password = "abc123";
      const hashedPassword = bcrypt.hash(password, config.users.passwordHash);

      // when
      const result = await bcrypt.compare(password, await hashedPassword);

      // then
      expect(result).toBe(true);
    });

    it("should return false if passwords are not same", async () => {
      // given
      const password = "abc123";
      const wrongPassword = "wrongPassword";
      const hashedPassword = bcrypt.hash(password, config.users.passwordHash);

      // when
      const result = await bcrypt.compare(wrongPassword, await hashedPassword);

      // then
      expect(result).toBe(false);
    });
  });
});
