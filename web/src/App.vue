<script setup>
import { onBeforeMount, ref } from "vue";

import { apiCheck } from "@/adapters/api-check.js";
import FooterComponent from "@/components/FooterComponent.vue";

const apiIsAvailable = ref(false);

onBeforeMount(async () => {
  apiIsAvailable.value = await apiCheck();
});
</script>

<template>
  <div v-if="apiIsAvailable">
    <h1>You did it!</h1>
    <p>
      Visit <a
        href="https://vuejs.org/"
        target="_blank"
        rel="noopener"
      >vuejs.org</a> to read the
      documentation
    </p>
    <FooterComponent />
  </div>
</template>

<style scoped></style>
