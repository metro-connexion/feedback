<script setup>
import { ref } from "vue";

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "password",
  },
  required: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);

const showPassword = ref(false);

function toggleVisibility() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <div class="password-input">
    <input
      :id="id"
      :type="showPassword ? 'text' : 'password'"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <button
      type="button"
      class="toggle-visibility"
      :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
      @click="toggleVisibility"
    >
      {{ showPassword ? "Masquer" : "Afficher" }}
    </button>
  </div>
</template>

<style scoped>
.password-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-input input {
  flex: 1;
}
</style>
