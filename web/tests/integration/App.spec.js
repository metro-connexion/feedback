import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";

import { apiCheck } from "@/adapters/api-check.js";
import App from "@/App.vue";

vi.mock("@/adapters/api-check.js", () => {
  return {
    apiCheck: vi.fn(),
  };
});

vi.mock("@/stores/auth.js", () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: vi.fn(() => false),
  })),
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/authentication/login", component: { template: "<div>Login</div>" } }],
});

describe("Integration | App", () => {
  it("should display router view when api is available", async () => {
    // given
    apiCheck.mockResolvedValue(true);

    // when
    const wrapper = await mount(App, {
      global: { plugins: [router] },
    });

    // then
    expect(wrapper.find("div").exists()).toBe(true);
  });

  it("should display empty page when api is not started", async () => {
    // given
    apiCheck.mockResolvedValue(false);

    // when
    const wrapper = await mount(App, {
      global: { plugins: [router] },
    });

    // then
    expect(wrapper.text()).toBe("");
  });
});
