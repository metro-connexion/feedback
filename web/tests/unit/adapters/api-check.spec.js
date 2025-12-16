import { describe, expect, it, vi } from "vitest";

import { apiCheck } from "@/adapters/api-check.js";

describe("Unit | Adapters | Api check", () => {
  it("should return true if api response 200", async () => {
    // given
    vi.spyOn(global, "fetch").mockResolvedValue({ status: 200 });

    // when
    const result = await apiCheck();

    // then
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith("/api/health");
  });

  it("should return false if api response another status", async () => {
    // given
    vi.spyOn(global, "fetch").mockResolvedValue({ status: 500 });

    // when
    const result = await apiCheck();

    // then
    expect(result).toBe(false);
  });

  it("should return false if an error occurred", async () => {
    // given
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));

    // when
    const result = await apiCheck();

    // then
    expect(result).toBe(false);
  });
});
