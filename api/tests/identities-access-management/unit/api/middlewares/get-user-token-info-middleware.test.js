import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getUserTokenInfoMiddleware,
} from "../../../../../src/identities-access-management/api/middlewares/get-user-token-info-middleware.js";
import {
  InvalidTokenError,
  RequiredTokenError,
} from "../../../../../src/identities-access-management/domain/errors.js";

describe("Unit | Identities Access Management | API | Middlewares | Get user token info middleware", () => {
  let res, next, decodedTokenService;

  beforeEach(() => {
    res = {};
    next = vi.fn();
    decodedTokenService = vi.fn();
  });

  it("should attach decoded token info to req.auth and call next", () => {
    // given
    const token = { userId: 1, firstname: "John", lastname: "Doe" };
    const req = {
      headers: {
        authorization: "Bearer valid.token.here",
      },
    };
    decodedTokenService.mockReturnValue(token);

    // when
    getUserTokenInfoMiddleware(req, res, next, decodedTokenService);

    // then
    expect(decodedTokenService).toHaveBeenCalledWith("valid.token.here");
    expect(req.auth).toEqual(token);
    expect(next).toHaveBeenCalled();
  });

  it("should call next with an error if token is missing", () => {
    // given
    const req = {
      headers: {},
    };

    // when
    getUserTokenInfoMiddleware(req, res, next, decodedTokenService);

    // then
    expect(decodedTokenService).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(new RequiredTokenError());
  });

  it("should call next with an error if token is invalid", () => {
    // given
    const req = {
      headers: {
        authorization: "Bearer invalid",
      },
    };
    decodedTokenService.mockImplementation(() => {
      throw new InvalidTokenError();
    });

    // when
    getUserTokenInfoMiddleware(req, res, next, decodedTokenService);

    // then
    expect(decodedTokenService).toHaveBeenCalledWith("invalid");
    expect(next).toHaveBeenCalledWith(new InvalidTokenError());
  });
});
