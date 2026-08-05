<template>
  <button class="primary" :disabled="disabled">
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
.primary {
  min-height: 52px;
  width: 100%;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--agua-petroleo), #0f6578);
  color: var(--agua-branco);
  box-shadow: 0 14px 28px rgba(13, 75, 94, 0.22);
  cursor: pointer;
  font: 600 15px/1.1 Poppins, sans-serif;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.primary:hover {
  box-shadow: 0 18px 34px rgba(13, 75, 94, 0.28);
  filter: saturate(1.05);
  transform: translateY(-1px);
}

.primary:active {
  transform: translateY(0);
}

.primary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.primary span {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  justify-content: center;
}
</style>
