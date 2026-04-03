<script setup>
import { useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.clearAuth();
  router.push("/authentication/login");
}
</script>

<template>
  <div class="user-info">
    <p class="user-name">
      {{ authStore.firstname }} {{ authStore.lastname }}
    </p>
    <button
      type="button"
      disabled
    >
      Paramètres du compte
    </button>
    <button
      type="button"
      @click="logout"
    >
      Se déconnecter
    </button>
  </div>
</template>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
