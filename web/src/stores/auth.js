import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("auth_token") || null);
  const firstname = ref(localStorage.getItem("auth_firstname") || null);
  const lastname = ref(localStorage.getItem("auth_lastname") || null);
  const email = ref(localStorage.getItem("auth_email") || null);

  function setAuth({ authToken, userFirstname, userLastname, userEmail }) {
    token.value = authToken;
    firstname.value = userFirstname;
    lastname.value = userLastname;
    email.value = userEmail;
    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("auth_firstname", userFirstname);
    localStorage.setItem("auth_lastname", userLastname);
    localStorage.setItem("auth_email", userEmail);
  }

  function clearAuth() {
    token.value = null;
    firstname.value = null;
    lastname.value = null;
    email.value = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_firstname");
    localStorage.removeItem("auth_lastname");
    localStorage.removeItem("auth_email");
  }

  function isAuthenticated() {
    return !!token.value;
  }

  return { token, firstname, lastname, email, setAuth, clearAuth, isAuthenticated };
});
