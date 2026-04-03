<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { authorizeCliLogin } from "@/adapters/cli-authentication.js";
import { useAuthStore } from "@/stores/auth.js";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const state = ref(route.query.state || "");
const callbackUrl = ref(route.query.callbackUrl || "");

const isLoading = ref(false);
const isAuthorized = ref(false);
const isDenied = ref(false);
const errorMessage = ref("");

const hasValidParams = computed(() => state.value && callbackUrl.value && isCallbackUrlSafe(callbackUrl.value));

function isCallbackUrlSafe(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated()) {
    router.push({ name: "login", query: { redirect: route.fullPath } });
    return;
  }

  if (!hasValidParams.value) {
    errorMessage.value = "Paramètres de connexion CLI invalides ou manquants.";
  }
});

async function authorize() {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const { token } = await authorizeCliLogin(authStore.token);
    const redirectUrl = new URL(callbackUrl.value);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("state", state.value);
    isAuthorized.value = true;
    window.location.href = redirectUrl.toString();
  } catch {
    errorMessage.value = "Une erreur est survenue lors de l'autorisation. Veuillez réessayer.";
  } finally {
    isLoading.value = false;
  }
}

function deny() {
  isDenied.value = true;
}
</script>

<template>
  <div class="cli-login-page">
    <h1>Connexion CLI</h1>

    <div
      v-if="isAuthorized"
      class="success"
    >
      <p>✔ Autorisation accordée. Vous pouvez fermer cet onglet.</p>
    </div>

    <div
      v-else-if="isDenied"
      class="denied"
    >
      <p>✖ Autorisation refusée. Vous pouvez fermer cet onglet.</p>
    </div>

    <div
      v-else-if="errorMessage"
      class="error"
    >
      <p role="alert">
        {{ errorMessage }}
      </p>
    </div>

    <div
      v-else-if="hasValidParams"
      class="prompt"
    >
      <p>Une application CLI demande l'accès à votre compte.</p>
      <p>Autorisez-vous la connexion CLI ?</p>
      <div class="actions">
        <button
          :disabled="isLoading"
          class="btn-authorize"
          @click="authorize"
        >
          {{ isLoading ? "Autorisation en cours..." : "Oui, autoriser" }}
        </button>
        <button
          :disabled="isLoading"
          class="btn-deny"
          @click="deny"
        >
          Non, refuser
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cli-login-page {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
}

.prompt p {
  margin-bottom: 0.75rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-authorize {
  background-color: #2d8a4e;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-authorize:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-deny {
  background-color: #c0392b;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-deny:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  color: green;
}

.denied {
  color: #c0392b;
}

.error {
  color: red;
}
</style>
