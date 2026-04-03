import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/stores/auth.js";

describe("Unit | Stores | Auth store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe("#setAuth", () => {
    it("should store auth data in the store and localStorage", () => {
      // given
      const authStore = useAuthStore();

      // when
      authStore.setAuth({
        authToken: "jwt-token",
        userFirstname: "John",
        userLastname: "Doe",
        userEmail: "john@example.com",
      });

      // then
      expect(authStore.token).toBe("jwt-token");
      expect(authStore.firstname).toBe("John");
      expect(authStore.lastname).toBe("Doe");
      expect(authStore.email).toBe("john@example.com");
      expect(localStorage.getItem("auth_token")).toBe("jwt-token");
      expect(localStorage.getItem("auth_firstname")).toBe("John");
      expect(localStorage.getItem("auth_lastname")).toBe("Doe");
      expect(localStorage.getItem("auth_email")).toBe("john@example.com");
    });
  });

  describe("#clearAuth", () => {
    it("should remove auth data from the store and localStorage", () => {
      // given
      const authStore = useAuthStore();
      authStore.setAuth({
        authToken: "jwt-token",
        userFirstname: "John",
        userLastname: "Doe",
        userEmail: "john@example.com",
      });

      // when
      authStore.clearAuth();

      // then
      expect(authStore.token).toBeNull();
      expect(authStore.firstname).toBeNull();
      expect(authStore.lastname).toBeNull();
      expect(authStore.email).toBeNull();
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(localStorage.getItem("auth_firstname")).toBeNull();
      expect(localStorage.getItem("auth_lastname")).toBeNull();
      expect(localStorage.getItem("auth_email")).toBeNull();
    });
  });

  describe("#isAuthenticated", () => {
    it("should return true when token is set", () => {
      // given
      const authStore = useAuthStore();
      authStore.setAuth({
        authToken: "jwt-token",
        userFirstname: "John",
        userLastname: "Doe",
        userEmail: "john@example.com",
      });

      // when
      const result = authStore.isAuthenticated();

      // then
      expect(result).toBe(true);
    });

    it("should return false when token is not set", () => {
      // given
      const authStore = useAuthStore();

      // when
      const result = authStore.isAuthenticated();

      // then
      expect(result).toBe(false);
    });

    it("should restore auth state from localStorage on initialization", () => {
      // given
      localStorage.setItem("auth_token", "stored-token");
      localStorage.setItem("auth_firstname", "Jane");
      localStorage.setItem("auth_lastname", "Smith");
      localStorage.setItem("auth_email", "jane@example.com");

      // when
      const authStore = useAuthStore();

      // then
      expect(authStore.token).toBe("stored-token");
      expect(authStore.firstname).toBe("Jane");
      expect(authStore.lastname).toBe("Smith");
      expect(authStore.email).toBe("jane@example.com");
      expect(authStore.isAuthenticated()).toBe(true);
    });
  });
});
