import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getUserController,
} from "../../../../../src/identities-access-management/api/controllers/get-user-controller.js";

describe("Unit | Identities Access Management | Api | Controllers | Get user controller", () => {
  let res, next, usecase;
  beforeEach(() => {
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    usecase = vi.fn();
  });

  it("should return user data on success", async () => {
    // given
    const userData = { firstname: "john", lastname: "doe" };
    usecase.mockResolvedValue(userData);
    const req = { auth: { userId: 123 } };

    // when
    await getUserController(req, res, next, usecase);

    // then
    expect(usecase).toHaveBeenCalledWith(123);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: userData });
  });

  it("should call next with error on failure", async () => {
    // given
    const error = new Error("User not found");
    usecase.mockRejectedValue(error);
    const req = { auth: { userId: 123 } };

    // when
    await getUserController(req, res, next, usecase);

    // then
    expect(usecase).toHaveBeenCalledWith(123);
    expect(next).toHaveBeenCalledWith(error);
  });
});
