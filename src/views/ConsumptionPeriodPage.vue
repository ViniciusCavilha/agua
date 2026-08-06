<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Consumo" :period-label="periodLabel">
        <section class="summary-grid">
          <article v-for="item in stats" :key="item.label" class="stat-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.detail }}</p>
          </article>
        </section>

        <section class="content-grid">
          <article class="usage-card">
            <div class="card-title">
              <div>
                <h2>{{ chartTitle }}</h2>
                <p>Consumo por dia em {{ volumeUnitLabel }}</p>
              </div>
              <span><ion-icon :icon="calendarOutline" /> {{ chartBadge }}</span>
            </div>

            <div class="bar-chart" aria-label="Grafico do periodo selecionado">
              <button
                v-for="bar in bars"
                :key="bar.day"
                class="bar-item"
                :class="{ active: activeBar === bar.day }"
                type="button"
                :aria-label="`${bar.day}: ${bar.liters}`"
                @click="toggleActiveBar(bar.day)"
                @focus="activeBar = bar.day"
                @blur="activeBar = ''"
                @mouseenter="activeBar = bar.day"
                @mouseleave="activeBar = ''"
              >
                <strong>{{ bar.liters }}</strong>
                <span class="empty">
                  <em>{{ bar.liters }}</em>
                </span>
                <small>{{ bar.day }}</small>
              </button>
            </div>
          </article>

          <article class="alert-card">
            <span class="alert-icon"><ion-icon :icon="alertCircleOutline" /></span>
            <h2>Periodo sem leituras</h2>
            <p>Esta tela ja esta pronta para receber os dados historicos quando o hidrometro for conectado.</p>
            <div class="health-row">
              <span>Total registrado</span>
              <strong>{{ totalRegistered }}</strong>
            </div>
          </article>
        </section>

        <article class="readings-card">
          <div class="card-title">
            <div>
              <h2>Leituras do periodo</h2>
              <p>Eventos capturados pelos medidores</p>
            </div>
          </div>

          <div class="empty-readings">
            <strong>Nenhuma leitura registrada</strong>
            <p>Os registros deste periodo aparecerao aqui automaticamente quando houver historico disponivel.</p>
          </div>
        </article>
      </AppShell>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, ref } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { alertCircleOutline, calendarOutline } from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';
import { getSettings } from '../data/settings-store.js';
import { getPeriodConsumptionReadings } from '../services/reading-service.js';

const props = defineProps({
  periodLabel: {
    type: String,
    required: true,
  },
  chartTitle: {
    type: String,
    required: true,
  },
  chartBadge: {
    type: String,
    required: true,
  },
  days: {
    type: Array,
    required: true,
  },
});

const settings = getSettings();
const activeBar = ref('');
const periodData = computed(() => getPeriodConsumptionReadings({ periodLabel: props.periodLabel, days: props.days }, settings));
const stats = computed(() => periodData.value.stats);
const bars = computed(() => periodData.value.bars);
const volumeUnitLabel = settings.measurementUnit === 'Metros cubicos' ? 'm3' : 'litros';
const totalRegistered = computed(() => stats.value[0]?.value ?? '0 L');

const toggleActiveBar = (day) => {
  activeBar.value = activeBar.value === day ? '' : day;
};
</script>

<style scoped>
.summary-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 20px;
}

.stat-card,
.usage-card,
.alert-card,
.readings-card {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  box-shadow: var(--agua-shadow);
}

.stat-card {
  display: grid;
  gap: 7px;
  padding: 18px;
}

.stat-card span,
.stat-card p {
  color: var(--agua-suave);
  font-size: 12px;
  margin: 0;
}

.stat-card strong {
  color: var(--agua-petroleo);
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1;
}

.content-grid {
  align-items: stretch;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 330px;
}

.usage-card,
.alert-card,
.readings-card {
  padding: 20px;
}

.card-title {
  align-items: flex-start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.card-title h2,
.alert-card h2 {
  color: var(--agua-petroleo);
  font-size: 17px;
  margin: 0 0 4px;
}

.card-title p,
.alert-card p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.card-title span {
  align-items: center;
  color: #188b84;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  gap: 6px;
  white-space: nowrap;
}

.bar-chart {
  align-items: end;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(7, 1fr);
  height: 280px;
  padding-top: 26px;
}

.bar-item {
  align-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: grid;
  gap: 8px;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  justify-items: center;
  min-width: 0;
  padding: 0;
  position: relative;
}

.bar-item strong {
  color: var(--agua-suave);
  font-size: 10px;
  font-weight: 700;
  opacity: 0.7;
  transition: color 0.18s ease, opacity 0.18s ease, transform 0.18s ease;
}

.bar-item span {
  align-self: end;
  background: rgba(31, 206, 195, 0.18);
  border: 1px solid rgba(31, 206, 195, 0.28);
  border-radius: 999px 999px 6px 6px;
  min-height: 8px;
  position: relative;
  transition: filter 0.18s ease, transform 0.18s ease;
  width: min(100%, 34px);
}

.bar-item span em {
  background: var(--agua-petroleo);
  border: 1px solid color-mix(in srgb, var(--agua-agua) 40%, transparent);
  border-radius: 999px;
  bottom: calc(100% + 10px);
  box-shadow: 0 10px 24px rgba(3, 48, 57, 0.2);
  color: #ffffff;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  left: 50%;
  opacity: 0;
  padding: 6px 9px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, 6px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  white-space: nowrap;
  z-index: 2;
}

.bar-item span em::after {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--agua-petroleo);
  content: '';
  left: 50%;
  position: absolute;
  top: 100%;
  transform: translateX(-50%);
}

.bar-item small {
  color: var(--agua-suave);
  font-size: 11px;
  font-weight: 700;
  transition: color 0.18s ease;
}

.bar-item:hover strong,
.bar-item:focus-visible strong,
.bar-item.active strong {
  color: var(--agua-petroleo);
  opacity: 1;
  transform: translateY(-2px);
}

.bar-item:hover span,
.bar-item:focus-visible span,
.bar-item.active span {
  filter: drop-shadow(0 10px 16px rgba(28, 167, 160, 0.16));
  transform: translateY(-3px);
}

.bar-item:hover span em,
.bar-item:focus-visible span em,
.bar-item.active span em {
  opacity: 1;
  transform: translate(-50%, 0);
}

.bar-item:hover small,
.bar-item:focus-visible small,
.bar-item.active small {
  color: var(--agua-petroleo);
}

.bar-item:focus-visible {
  outline: 2px solid var(--agua-agua);
  outline-offset: 6px;
}

.alert-card {
  align-content: start;
  display: grid;
  gap: 14px;
}

.alert-icon {
  background: #e6f6f5;
  border-radius: 17px;
  color: var(--agua-agua);
  display: grid;
  font-size: 30px;
  height: 58px;
  place-items: center;
  width: 58px;
}

.health-row {
  align-items: center;
  background: #f4f8f8;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 14px;
}

.health-row span {
  color: var(--agua-suave);
  font-size: 12px;
  font-weight: 700;
}

.health-row strong {
  color: var(--agua-sucesso);
  font-size: 24px;
}

.readings-card {
  margin-top: 20px;
}

.empty-readings {
  background: var(--agua-muted);
  border: 1px dashed var(--agua-borda);
  border-radius: 16px;
  display: grid;
  gap: 6px;
  margin-top: 16px;
  padding: 18px;
}

.empty-readings strong {
  color: var(--agua-petroleo);
  font-size: 14px;
}

.empty-readings p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.65;
  margin: 0;
}

@media (max-width: 980px) {
  .summary-grid,
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }

  .usage-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 620px) {
  .summary-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
