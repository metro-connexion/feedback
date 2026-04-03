<script setup>
import { onBeforeMount, ref } from "vue";
import { RouterView } from "vue-router";

import { apiCheck } from "@/adapters/api-check.js";
import FooterComponent from "@/components/FooterComponent.vue";

const apiIsAvailable = ref(false);

onBeforeMount(async () => {
  apiIsAvailable.value = await apiCheck();
});
</script>

<template>
  <div v-if="apiIsAvailable">
    <RouterView />
    <FooterComponent />
  </div>
</template>

<style scoped></style>
