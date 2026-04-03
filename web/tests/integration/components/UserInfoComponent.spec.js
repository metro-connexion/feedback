import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";

import UserInfoComponent from "@/components/UserInfoComponent.vue";
import { useAuthStore } from "@/stores/auth.js";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/authentication/login", component: { template: "<div>Login</div>" } },
    { path: "/accueil", component: { template: "<div>Accueil</div>" } },
  ],
});

describe("Integration | Components | User info component", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("should display user first name and last name", () => {
    // given
    const authStore = useAuthStore();
    authStore.setAuth({
      authToken: "jwt-token",
      userFirstname: "John",
      userLastname: "Doe",
      userEmail: "john@example.com",
    });

    // when
    const wrapper = mount(UserInfoComponent, {
      global: { plugins: [router] },
    });

    // then
    expect(wrapper.text()).toContain("John");
    expect(wrapper.text()).toContain("Doe");
  });

  it("should display a disabled account settings button", () => {
    // given
    const authStore = useAuthStore();
    authStore.setAuth({
      authToken: "jwt-token",
      userFirstname: "John",
      userLastname: "Doe",
      userEmail: "john@example.com",
    });

    // when
    const wrapper = mount(UserInfoComponent, {
      global: { plugins: [router] },
    });

    // then
    const buttons = wrapper.findAll("button");
    const accountButton = buttons.find((btn) => btn.text().includes("Paramètres"));
    expect(accountButton.attributes("disabled")).toBeDefined();
  });

  it("should clear auth and redirect to login on logout", async () => {
    // given
    const authStore = useAuthStore();
    authStore.setAuth({
      authToken: "jwt-token",
      userFirstname: "John",
      userLastname: "Doe",
      userEmail: "john@example.com",
    });
    const pushSpy = vi.spyOn(router, "push");

    // when
    const wrapper = mount(UserInfoComponent, {
      global: { plugins: [router] },
    });
    const buttons = wrapper.findAll("button");
    const logoutButton = buttons.find((btn) => btn.text().includes("déconnecter"));
    await logoutButton.trigger("click");

    // then
    expect(authStore.isAuthenticated()).toBe(false);
    expect(pushSpy).toHaveBeenCalledWith("/authentication/login");
  });
});
