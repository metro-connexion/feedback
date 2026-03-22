import { describe, expect, it, vi } from "vitest";

import { authenticate } from "@/adapters/authentication.js";

describe("Unit | Adapters | Authentication", () => {
  describe("#authenticate", () => {
    it("should return token and userId on success", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            userId: 42,
            attributes: { token: "jwt-token" },
          },
        }),
      });

      // when
      const result = await authenticate({ email: "user@example.com", password: "secret" });

      // then
      expect(result).toEqual({ token: "jwt-token", userId: 42 });
      expect(global.fetch).toHaveBeenCalledWith("/api/authentication/authenticate/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "user@example.com", password: "secret" }),
      });
    });

    it("should throw an error when response is not ok", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Incorrect password" }),
      });

      // when / then
      await expect(authenticate({ email: "user@example.com", password: "wrong" })).rejects.toThrow("Incorrect password");
    });

    it("should throw a default error when response has no error message", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      });

      // when / then
      await expect(authenticate({ email: "user@example.com", password: "wrong" })).rejects.toThrow("Authentication failed");
    });
  });
});
