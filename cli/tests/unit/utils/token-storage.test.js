import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { clearToken, getToken, setToken } from "../../../src/utils/token-storage.js";

const CONFIG_DIR = join(homedir(), ".feedback");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

describe("Unit | Utils | Token storage", () => {
  beforeEach(() => {
    rmSync(CONFIG_DIR, { recursive: true, force: true });
  });

  afterEach(() => {
    rmSync(CONFIG_DIR, { recursive: true, force: true });
  });

  describe("#getToken", () => {
    it("should return null when no config file exists", () => {
      // when
      const result = getToken();

      // then
      expect(result).toBeNull();
    });

    it("should return the stored token when it exists", () => {
      // given
      mkdirSync(CONFIG_DIR, { recursive: true });
      writeFileSync(CONFIG_FILE, JSON.stringify({ token: "my-jwt-token" }), "utf8");

      // when
      const result = getToken();

      // then
      expect(result).toBe("my-jwt-token");
    });

    it("should return null when config file has no token", () => {
      // given
      mkdirSync(CONFIG_DIR, { recursive: true });
      writeFileSync(CONFIG_FILE, JSON.stringify({}), "utf8");

      // when
      const result = getToken();

      // then
      expect(result).toBeNull();
    });
  });

  describe("#setToken", () => {
    it("should create the config directory and store the token", () => {
      // when
      setToken("new-jwt-token");
      const result = getToken();

      // then
      expect(result).toBe("new-jwt-token");
    });

    it("should overwrite an existing token", () => {
      // given
      setToken("old-token");

      // when
      setToken("new-token");
      const result = getToken();

      // then
      expect(result).toBe("new-token");
    });
  });

  describe("#clearToken", () => {
    it("should remove the token from the config", () => {
      // given
      setToken("jwt-token");

      // when
      clearToken();
      const result = getToken();

      // then
      expect(result).toBeNull();
    });

    it("should not throw when no config file exists", () => {
      // when / then
      expect(() => clearToken()).not.toThrow();
    });
  });
});
