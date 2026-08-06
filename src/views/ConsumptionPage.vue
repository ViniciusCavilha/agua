<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Consumo" period-label="7 dias">
        <section class="summary-grid">
          <article v-for="item in visibleConsumptionStats" :key="item.label" class="stat-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.detail }}</p>
          </article>
        </section>

        <section class="content-grid">
          <article class="usage-card">
            <div class="card-title">
              <div>
                <h2>Historico semanal</h2>
                <p>Consumo por dia em {{ volumeUnitLabel }}</p>
              </div>
              <span><ion-icon :icon="calendarOutline" /> {{ chartBadge }}</span>
            </div>

            <div class="bar-chart" aria-label="Grafico semanal de consumo">
              <div v-for="bar in visibleWeeklyBars" :key="bar.day" class="bar-item">
                <strong>{{ bar.liters }}</strong>
                <span :class="{ empty: bar.value === 0 }" :style="{ height: bar.value ? bar.value + '%' : '0%' }" />
                <small>{{ bar.day }}</small>
              </div>
            </div>
          </article>

          <article class="alert-card">
            <span class="alert-icon"><ion-icon :icon="alertCircleOutline" /></span>
            <h2>{{ alertTitle }}</h2>
            <p>{{ alertMessage }}</p>
            <div class="health-row">
              <span>{{ settings.simulationMode ? 'Motor de simulacao' : 'Saude da rede' }}</span>
              <strong>{{ settings.simulationMode ? settings.readingInterval + 's' : '0%' }}</strong>
            </div>
          </article>
        </section>

        <article class="readings-card">
          <div class="card-title">
            <div>
              <h2>Ultimas leituras</h2>
              <p>Eventos capturados pelos medidores</p>
            </div>
          </div>

          <div v-if="readings.length" class="readings-list">
            <div v-for="reading in readings" :key="reading.time + reading.area" class="reading-row">
              <span>{{ reading.time }}</span>
              <strong>{{ reading.area }}</strong>
              <em>{{ reading.liters }}</em>
              <small>{{ reading.status }}</small>
            </div>
          </div>

          <div v-else class="empty-readings">
            <strong>Nenhuma leitura registrada</strong>
            <p>Quando o sistema receber os primeiros dados, eles serao listados automaticamente aqui.</p>
          </div>
        </article>
      </AppShell>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { alertCircleOutline, calendarOutline } from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';
import { getSettings } from '../data/settings-store.js';
import { getConsumptionReadings } from '../services/reading-service.js';

const settings = getSettings();
const consumptionData = getConsumptionReadings(settings);

const volumeUnitLabel = settings.measurementUnit === 'Metros cubicos' ? 'm3' : 'litros';

const visibleConsumptionStats = consumptionData.stats;
const visibleWeeklyBars = consumptionData.weeklyBars;
const readings = consumptionData.readings;

const chartBadge = settings.presentationMode ? 'Modo apresentacao' : settings.simulationMode ? 'Semana simulada' : 'Semana atual';
const alertTitle = settings.anomalyDemo ? 'Anomalia simulada' : settings.presentationMode ? 'Demo operacional' : 'Aguardando leituras';
const alertMessage = settings.anomalyDemo
  ? 'Cenario de demonstracao ativo: o sistema simula consumo fora do padrao para testar alertas.'
  : settings.presentationMode
    ? 'Modo apresentacao ativo: as leituras simuladas representam um dia comum de operacao.'
  : 'Assim que os medidores enviarem informacoes, os alertas e variacoes aparecem aqui.';
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
  display: grid;
  gap: 8px;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  justify-items: center;
}

.bar-item strong {
  color: var(--agua-suave);
  font-size: 10px;
  font-weight: 700;
}

.bar-item span {
  align-self: end;
  background: linear-gradient(180deg, var(--agua-agua), var(--agua-petroleo));
  border-radius: 999px 999px 6px 6px;
  min-height: 28px;
  width: min(100%, 34px);
}

.bar-item span.empty {
  background: rgba(31, 206, 195, 0.18);
  border: 1px solid rgba(31, 206, 195, 0.28);
  min-height: 8px;
}

.bar-item small {
  color: var(--agua-suave);
  font-size: 11px;
  font-weight: 700;
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

.readings-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.empty-readings {
  background: #f7fbfb;
  border: 1px dashed #cfe2e5;
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

.reading-row {
  align-items: center;
  background: #f7fbfb;
  border: 1px solid #edf2f2;
  border-radius: 14px;
  display: grid;
  gap: 10px;
  grid-template-columns: 70px 1fr 90px 150px;
  padding: 13px 14px;
}

.reading-row span,
.reading-row small {
  color: var(--agua-suave);
  font-size: 12px;
  font-style: normal;
}

.reading-row strong {
  color: var(--agua-texto);
  font-size: 13px;
}

.reading-row em {
  color: var(--agua-petroleo);
  font-size: 13px;
  font-style: normal;
  font-weight: 700;
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

  .reading-row {
    align-items: start;
    grid-template-columns: 1fr;
  }
}
</style>
