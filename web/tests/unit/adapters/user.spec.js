import { describe, expect, it, vi } from "vitest";

import { getUser } from "@/adapters/user.js";

describe("Unit | Adapters | User", () => {
  describe("#getUser", () => {
    it("should return firstname and lastname on success", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: { firstname: "John", lastname: "Doe" },
        }),
      });

      // when
      const result = await getUser("jwt-token");

      // then
      expect(result).toEqual({ firstname: "John", lastname: "Doe" });
      expect(global.fetch).toHaveBeenCalledWith("/api/user", {
        headers: { "Authorization": "Bearer jwt-token" },
      });
    });

    it("should throw an error when response is not ok", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Token is required" }),
      });

      // when / then
      await expect(getUser("invalid-token")).rejects.toThrow("Token is required");
    });

    it("should throw a default error when response has no error message", async () => {
      // given
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      });

      // when / then
      await expect(getUser("invalid-token")).rejects.toThrow("Failed to fetch user");
    });
  });
});
