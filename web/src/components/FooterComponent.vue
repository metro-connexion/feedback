<script setup>
import pkg from "@/../package.json";
</script>

<template>
  <footer aria-label="Menu de bas de page">
    <p>Copyright ©{{ new Date().getFullYear() }} | {{ pkg.author }}</p>
    <p>Version {{ pkg.version }}</p>
  </footer>
</template>

<style scoped>

</style>
