import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loginHandler } from "../../../src/handlers/login-handler.js";
import { createOraMock } from "../helpers/createOraMock.js";

describe("Unit | Handlers | Login handler", () => {
  let oraService, openBrowserService, setTokenService;

  beforeEach(() => {
    oraService = createOraMock();
    openBrowserService = vi.fn();
    setTokenService = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should open the browser with a login URL and store the token on success", async () => {
    // given
    let capturedLoginUrl;
    openBrowserService.mockImplementation((loginUrl) => {
      capturedLoginUrl = loginUrl;
      // Simulate the browser completing the flow by making a request to the CLI callback server
      const url = new URL(loginUrl);
      const callbackUrl = new URL(decodeURIComponent(url.searchParams.get("callbackUrl")));
      const state = url.searchParams.get("state");
      callbackUrl.searchParams.set("token", "cli-jwt-token");
      callbackUrl.searchParams.set("state", state);

      setTimeout(() => {
        fetch(callbackUrl.toString()).catch(() => {});
      }, 10);
    });

    // when
    await loginHandler({ url: "http://localhost:5173", oraService, openBrowserService, setTokenService });

    // then
    expect(openBrowserService).toHaveBeenCalledOnce();
    expect(capturedLoginUrl).toContain("/authentication/cli-login");
    expect(capturedLoginUrl).toContain("state=");
    expect(capturedLoginUrl).toContain("callbackUrl=");
    expect(setTokenService).toHaveBeenCalledWith("cli-jwt-token");
    expect(oraService.succeed).toHaveBeenCalledWith("Connexion réussie !");
  });

  it("should fail when the callback state does not match", async () => {
    // given
    openBrowserService.mockImplementation((loginUrl) => {
      const url = new URL(loginUrl);
      const callbackUrl = new URL(decodeURIComponent(url.searchParams.get("callbackUrl")));
      callbackUrl.searchParams.set("token", "cli-jwt-token");
      callbackUrl.searchParams.set("state", "wrong-state");

      setTimeout(() => {
        fetch(callbackUrl.toString()).catch(() => {});
      }, 10);
    });

    // when / then
    await expect(
      loginHandler({ url: "http://localhost:5173", oraService, openBrowserService, setTokenService }),
    ).rejects.toThrow("Invalid state");

    expect(setTokenService).not.toHaveBeenCalled();
    expect(oraService.fail).toHaveBeenCalled();
  });

  it("should fail when no token is returned in the callback", async () => {
    // given
    openBrowserService.mockImplementation((loginUrl) => {
      const url = new URL(loginUrl);
      const callbackUrl = new URL(decodeURIComponent(url.searchParams.get("callbackUrl")));
      const state = url.searchParams.get("state");
      callbackUrl.searchParams.set("state", state);
      // no token param

      setTimeout(() => {
        fetch(callbackUrl.toString()).catch(() => {});
      }, 10);
    });

    // when / then
    await expect(
      loginHandler({ url: "http://localhost:5173", oraService, openBrowserService, setTokenService }),
    ).rejects.toThrow("Missing token");

    expect(setTokenService).not.toHaveBeenCalled();
    expect(oraService.fail).toHaveBeenCalled();
  });
});
