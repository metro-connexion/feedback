import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "../../../../config.js";
import * as passwordService from "../../../../src/identities-access-management/services/password-service.js";

describe("Unit | Identities Access Management | Services | Password service", () => {
  beforeEach(() => {
    config.users.passwordHash = 10;
  });
  describe("#generatePassword", () => {
    it("should return hashed password", async () => {
      // given
      const passwordToHash = "abc123";
      vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed");

      // when
      const result = await passwordService.generatePassword(passwordToHash);

      // then
      expect(result).toBe("hashed");
      expect(bcrypt.hash).toHaveBeenCalledWith(passwordToHash, config.users.passwordHash);
    });

    it("should throw an error if an error occurred", async () => {
      // given
      const passwordToHash = "abc123";
      vi.spyOn(bcrypt, "hash").mockRejectedValue(new Error("error"));

      // when
      const result = passwordService.generatePassword(passwordToHash);

      // then
      await expect(result).rejects.toThrow("error");
      expect(bcrypt.hash).toHaveBeenCalledWith(passwordToHash, config.users.passwordHash);
    });
  });

  describe("#checkPassword", () => {
    it("should return true if passwords are same", async () => {
      // given
      const passwordToCheck = "abc123";
      const hashedPassword = "hashed";
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true);

      // when
      const result = await passwordService.checkPassword(passwordToCheck, hashedPassword);

      // then
      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(passwordToCheck, hashedPassword);
    });

    it("should return false if passwords are not same", async () => {
      // given
      const passwordToCheck = "abc123";
      const hashedPassword = "hashed";
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false);

      // when
      const result = await passwordService.checkPassword(passwordToCheck, hashedPassword);

      // then
      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(passwordToCheck, hashedPassword);
    });

    it("should throw an error if an error occurred", async () => {
      // given
      const passwordToCheck = "abc123";
      const hashedPassword = "hashed";
      vi.spyOn(bcrypt, "compare").mockRejectedValue(new Error("error"));

      // when
      const result = passwordService.checkPassword(passwordToCheck, hashedPassword);

      // then
      await expect(result).rejects.toThrow("error");
      expect(bcrypt.compare).toHaveBeenCalledWith(passwordToCheck, hashedPassword);
    });
  });
});
