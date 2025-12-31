import { vi } from "vitest";
/**
 * @file Creates a mock for the ora spinner.
 * @returns {import('ora').Ora & {succeed: vi.Mock, fail: vi.Mock}} The mocked ora function with spinner methods.
 */
export function createOraMock() {
  const spinner = {
    start: vi.fn(() => spinner),
    succeed: vi.fn(),
    fail: vi.fn(),
  };

  const oraMock = vi.fn(() => spinner);
  // expose succeed/fail on the function for easier assertions
  oraMock.succeed = spinner.succeed;
  oraMock.fail = spinner.fail;

  return oraMock;
}
