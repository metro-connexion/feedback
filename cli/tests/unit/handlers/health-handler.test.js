import { healthHandler } from "../../../src/handlers/health-handler.js";
import { createOraMock } from "../helpers/createOraMock.js";

describe("Unit | Handlers | Health handler", () => {
  let oraService, apiCheckService;
  beforeEach(() => {
    oraService = createOraMock();
    apiCheckService = vi.fn();
  });

  it("should send success message if request succeeded", async () => {
    // given
    apiCheckService.mockResolvedValue(true);

    // when
    await healthHandler({ url: "http://example.net", oraService, apiCheckService });

    // then
    expect(apiCheckService).toHaveBeenCalledWith("http://example.net");
    expect(oraService.succeed).toHaveBeenCalledWith("Api is healthy.");
  });

  it("should send failed message if api is unable", async () => {
    // given
    apiCheckService.mockResolvedValue(false);

    // when
    await healthHandler({ url: "http://example.net", apiCheckService, oraService });

    // then
    expect(apiCheckService).toHaveBeenCalledWith("http://example.net");
    expect(oraService.fail).toHaveBeenCalledWith("Unable to reach the api.");
  });
});
