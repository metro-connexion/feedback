import { apiCheck } from "../../../src/adapters/api-check.js";

describe("Unit | Adapters | Api check", () => {
  describe("#apiCheck", () => {
    it("should return true if api send 200 status code", async () => {
      // given
      global.fetch = vi.fn().mockResolvedValue({ status: 200 });

      // when
      const result = await apiCheck("http://example.net");

      // then
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith("http://example.net/api/health");
    });

    it("should return false if api send another status", async () => {
      // given
      global.fetch = vi.fn().mockResolvedValue({ status: 500 });

      // when
      const result = await apiCheck("http://example.net");

      // then
      expect(result).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith("http://example.net/api/health");
    });

    it("should return false if fetch throw error", async () => {
      // given
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      // when
      const result = await apiCheck("http://example.net");

      // then
      expect(result).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith("http://example.net/api/health");
    });
  });
});
