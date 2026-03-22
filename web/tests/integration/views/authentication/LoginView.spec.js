import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";

import { authenticate } from "@/adapters/authentication.js";
import { getUser } from "@/adapters/user.js";
import LoginView from "@/views/authentication/LoginView.vue";

vi.mock("@/adapters/authentication.js", () => ({
  authenticate: vi.fn(),
}));

vi.mock("@/adapters/user.js", () => ({
  getUser: vi.fn(),
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/authentication/login", component: LoginView },
    { path: "/accueil", component: { template: "<div>Accueil</div>" } },
  ],
});

describe("Integration | Views | Authentication | Login view", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("should render email and password fields and submit button", () => {
    // given / when
    const wrapper = mount(LoginView, {
      global: { plugins: [router] },
    });

    // then
    expect(wrapper.find("input[type='email']").exists()).toBe(true);
    expect(wrapper.find("input[id='password']").exists()).toBe(true);
    expect(wrapper.find("button[type='submit']").exists()).toBe(true);
  });

  it("should show an error when fields are empty on submit", async () => {
    // given
    const wrapper = mount(LoginView, {
      global: { plugins: [router] },
    });

    // when
    await wrapper.find("form").trigger("submit");

    // then
    expect(wrapper.text()).toContain("requis");
  });

  it("should show an error when email is invalid", async () => {
    // given
    const wrapper = mount(LoginView, {
      global: { plugins: [router] },
    });
    await wrapper.find("input[type='email']").setValue("not-an-email");
    await wrapper.find("input[id='password']").setValue("secret");

    // when
    await wrapper.find("form").trigger("submit");

    // then
    expect(wrapper.text()).toContain("valide");
  });

  it("should show an error when email is missing the domain", async () => {
    // given
    const wrapper = mount(LoginView, {
      global: { plugins: [router] },
    });
    await wrapper.find("input[type='email']").setValue("user@");
    await wrapper.find("input[id='password']").setValue("secret");

    // when
    await wrapper.find("form").trigger("submit");

    // then
    expect(wrapper.text()).toContain("valide");
  });

  it("should call authenticate and getUser on valid submit and redirect", async () => {
    // given
    authenticate.mockResolvedValue({ token: "jwt-token", userId: 1 });
    getUser.mockResolvedValue({ firstname: "John", lastname: "Doe" });
    const pushSpy = vi.spyOn(router, "push");

    const wrapper = mount(LoginView, {
      global: { plugins: [router] },
    });
    await wrapper.find("input[type='email']").setValue("user@example.com");
    await wrapper.find("input[id='password']").setValue("secret");

    // when
    await wrapper.find("form").trigger("submit");
    await new Promise((resolve) => setTimeout(resolve, 0));

    // then
    expect(authenticate).toHaveBeenCalledWith({ email: "user@example.com", password: "secret" });
    expect(getUser).toHaveBeenCalledWith("jwt-token");
    expect(pushSpy).toHaveBeenCalledWith("/accueil");
  });

  it("should display an error message on authentication failure", async () => {
    // given
    authenticate.mockRejectedValue(new Error("Incorrect password"));

    const wrapper = mount(LoginView, {
      global: { plugins: [router] },
    });
    await wrapper.find("input[type='email']").setValue("user@example.com");
    await wrapper.find("input[id='password']").setValue("wrong");

    // when
    await wrapper.find("form").trigger("submit");
    await new Promise((resolve) => setTimeout(resolve, 0));

    // then
    expect(wrapper.text()).toContain("Mot de passe incorrect.");
  });
});
