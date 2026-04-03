import { describe, expect, it, vi } from "vitest";

import { authorizeCliLogin } from "@/adapters/cli-authentication.js";

describe("Unit | Adapters | CLI Authentication", () => {
  describe("#authorizeCliLogin", () => {
    it("should return a CLI token on success", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            type: "cli-authentication",
            attributes: { token: "cli-jwt-token" },
          },
        }),
      });

      // when
      const result = await authorizeCliLogin("user-jwt-token");

      // then
      expect(result).toEqual({ token: "cli-jwt-token" });
      expect(global.fetch).toHaveBeenCalledWith("/api/authentication/cli/authorize", {
        method: "POST",
        headers: {
          "Authorization": "Bearer user-jwt-token",
          "Content-Type": "application/json",
        },
      });
    });

    it("should throw an error when response is not ok", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Token is required" }),
      });

      // when / then
      await expect(authorizeCliLogin("invalid-token")).rejects.toThrow("Token is required");
    });

    it("should throw a default error when response has no error message", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      });

      // when / then
      await expect(authorizeCliLogin("invalid-token")).rejects.toThrow("CLI authorization failed");
    });
  });
});
