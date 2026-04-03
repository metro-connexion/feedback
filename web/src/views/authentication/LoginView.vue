<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { authenticate } from "@/adapters/authentication.js";
import { getUser } from "@/adapters/user.js";
import PasswordInputComponent from "@/components/PasswordInputComponent.vue";
import { useAuthStore } from "@/stores/auth.js";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function handleSubmit() {
  errorMessage.value = "";

  if (!email.value || !password.value) {
    errorMessage.value = "L'email et le mot de passe sont requis.";
    return;
  }

  if (!isValidEmail(email.value)) {
    errorMessage.value = "L'adresse email n'est pas valide.";
    return;
  }

  isLoading.value = true;
  try {
    const { token } = await authenticate({ email: email.value, password: password.value });
    const user = await getUser(token);
    authStore.setAuth({
      authToken: token,
      userFirstname: user.firstname,
      userLastname: user.lastname,
      userEmail: email.value,
    });
    const redirect = route.query.redirect;
    if (redirect && typeof redirect === "string" && redirect.startsWith("/")) {
      router.push(redirect);
    } else {
      router.push("/accueil");
    }
  } catch (error) {
    switch (error.message) {
    case "User not found":
      errorMessage.value = "Aucun compte trouvé avec cet email.";
      break;
    case "Incorrect password":
      errorMessage.value = "Mot de passe incorrect.";
      break;
    default:
      errorMessage.value = "Une erreur est survenue. Veuillez réessayer.";
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <h1>Connexion</h1>
    <form
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="votre@email.com"
          required
        >
      </div>
      <div class="form-group">
        <label for="password">Mot de passe</label>
        <PasswordInputComponent
          id="password"
          v-model="password"
          placeholder="Mot de passe"
          required
        />
      </div>
      <p
        v-if="errorMessage"
        class="error"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <button
        type="submit"
        :disabled="isLoading"
      >
        {{ isLoading ? "Connexion en cours..." : "Se connecter" }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.error {
  color: red;
  margin-bottom: 1rem;
}
</style>
