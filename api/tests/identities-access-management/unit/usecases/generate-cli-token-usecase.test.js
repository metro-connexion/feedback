import { describe, expect, it, vi } from "vitest";

import { generateCliTokenUsecase } from "../../../../src/identities-access-management/usecases/generate-cli-token-usecase.js";

describe("Unit | Identities Access Management | Usecases | Generate CLI token usecase", () => {
  describe("#generateCliTokenUsecase", () => {
    it("should return a token generated from userId and identityProvider", async () => {
      // given
      const tokenService = vi.fn().mockReturnValue("generated-cli-token");

      // when
      const result = await generateCliTokenUsecase({ userId: 42, identityProvider: "login" }, tokenService);

      // then
      expect(tokenService).toHaveBeenCalledWith({ userId: 42, identityProvider: "login" });
      expect(result).toEqual({ token: "generated-cli-token" });
    });
  });
});
