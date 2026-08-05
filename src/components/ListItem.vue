<template>
  <button class="item" type="button">
    <span :class="['icon', color]">
      <ion-icon :icon="icon" />
    </span>

    <span class="copy">
      <small>{{ label }}</small>
      <strong>{{ value }}</strong>
    </span>

    <ion-icon class="arrow" :icon="chevronForwardOutline" />
  </button>
</template>

<script setup>
import { IonIcon } from '@ionic/vue';
import { chevronForwardOutline } from 'ionicons/icons';

defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.item {
  align-items: center;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(225, 231, 232, 0.78);
  color: inherit;
  cursor: pointer;
  display: flex;
  gap: 12px;
  padding: 15px 2px;
  text-align: left;
  width: 100%;
}

.item:last-child {
  border-bottom: 0;
}

.item:hover .arrow {
  color: var(--agua-agua);
  transform: translateX(2px);
}

.icon {
  border-radius: 13px;
  display: grid;
  flex: 0 0 44px;
  font-size: 20px;
  height: 44px;
  place-items: center;
  width: 44px;
}

.water {
  background: #e6f6f5;
  color: var(--agua-agua);
}

.success {
  background: #eaf9ef;
  color: var(--agua-sucesso);
}

.alert {
  background: #fff5e5;
  color: var(--agua-alerta);
}

.copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

small {
  color: var(--agua-suave);
  font-size: 11px;
  line-height: 1.35;
}

strong {
  color: var(--agua-texto);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
}

.arrow {
  color: #a1b0b5;
  flex: 0 0 auto;
  font-size: 17px;
  transition: color 0.18s ease, transform 0.18s ease;
}
</style>
