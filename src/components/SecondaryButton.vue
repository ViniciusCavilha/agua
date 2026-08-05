<template>
  <button class="secondary" :disabled="disabled">
    <span>
      <slot />
    </span>
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.secondary {
  min-height: 50px;
  width: 100%;
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  background: var(--agua-branco);
  color: var(--agua-petroleo);
  cursor: pointer;
  font: 600 14px/1.1 Poppins, sans-serif;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.secondary:hover {
  border-color: rgba(28, 167, 160, 0.55);
  box-shadow: 0 12px 24px rgba(13, 75, 94, 0.08);
  transform: translateY(-1px);
}

.secondary:active {
  transform: translateY(0);
}

.secondary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.secondary span {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  justify-content: center;
}
</style>
