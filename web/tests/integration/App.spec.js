import { mount } from "@vue/test-utils";

import { apiCheck } from "@/adapters/api-check.js";
import App from "@/App.vue";
import FooterComponent from "@/components/FooterComponent.vue";

vi.mock("@/adapters/api-check.js", () => {
  return {
    apiCheck: vi.fn(),
  };
});

describe("Integration | App", () => {
  it("should display page and footer", async () => {
    // given
    apiCheck.mockResolvedValue(true);

    // when
    const wrapper = await mount(App);

    // then
    expect(wrapper.text()).toContain("You did it!");
    expect(wrapper.findComponent(FooterComponent)).toBeTruthy();
  });

  it("should display empty page when api is not started", async () => {
    // given
    apiCheck.mockResolvedValue(false);

    // when
    const wrapper = await mount(App);

    // then
    expect(wrapper.text()).toBe("");
  });
});
