import { afterEach, vi } from "vitest";

afterEach(function() {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.clearAllMocks();
});
