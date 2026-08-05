<template>
  <article class="metric">
    <span class="eyebrow">{{ title }}</span>
    <strong>{{ value }}</strong>
    <span :class="['trend', trend]">
      <ion-icon v-if="trend !== 'neutral'" :icon="trend === 'up' ? trendingUpOutline : trendingDownOutline" />
      {{ variation }}
    </span>
  </article>
</template>

<script setup>
import { IonIcon } from '@ionic/vue';
import { trendingDownOutline, trendingUpOutline } from 'ionicons/icons';

defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  variation: {
    type: String,
    required: true,
  },
  trend: {
    type: String,
    required: true,
    validator: (value) => ['up', 'down', 'neutral'].includes(value),
  },
});
</script>

<style scoped>
.metric {
  background:
    linear-gradient(135deg, rgba(28, 167, 160, 0.12), rgba(255, 255, 255, 0) 48%),
    var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  box-shadow: var(--agua-shadow);
  display: flex;
  flex-direction: column;
  gap: 7px;
  overflow: hidden;
  padding: 20px;
  position: relative;
}

.metric::after {
  background: linear-gradient(180deg, var(--agua-agua), var(--agua-petroleo));
  border-radius: 999px;
  content: '';
  height: 62px;
  opacity: 0.16;
  position: absolute;
  right: 18px;
  top: 18px;
  width: 8px;
}

.eyebrow {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.4;
}

strong {
  color: var(--agua-petroleo);
  font-size: clamp(28px, 8vw, 38px);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.05;
}

.trend {
  align-items: center;
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  gap: 5px;
}

.down {
  color: var(--agua-sucesso);
}

.up {
  color: var(--agua-erro);
}

.neutral {
  color: var(--agua-suave);
}
</style>
