<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Dashboard">
        <section class="hero-strip">
          <div>
            <span>Resumo operacional</span>
            <h2>{{ heroTitle }}</h2>
            <p>{{ heroDescription }}</p>
          </div>
          <strong>{{ currentConsumption }}</strong>
        </section>

        <section class="grid">
          <div class="main-column">
            <MetricCard title="Consumo hoje" :value="currentConsumption" :variation="dashboardStatus" trend="neutral" />
            <article class="device-status-card">
              <div class="card-title">
                <div>
                  <h2>Dispositivo principal</h2>
                  <p>{{ deviceSummaryText }}</p>
                </div>
                <span :class="['device-badge', statusClass(activeDevice?.status)]">
                  <i />
                  {{ activeDevice?.status || 'Nao vinculado' }}
                </span>
              </div>

              <div v-if="activeDevice" class="device-panel">
                <span class="device-icon"><ion-icon :icon="hardwareChipOutline" /></span>
                <div>
                  <strong>{{ activeDevice.name }}</strong>
                  <small>{{ activeDevice.deviceCode }}</small>
                </div>
                <router-link to="/dispositivos">Gerenciar</router-link>
              </div>

              <div v-else class="device-panel empty-device">
                <span class="device-icon"><ion-icon :icon="hardwareChipOutline" /></span>
                <div>
                  <strong>Nenhum dispositivo vinculado</strong>
                  <small>Cadastre um codigo para preparar a conexao do ESP32.</small>
                </div>
                <router-link to="/dispositivos">Vincular</router-link>
              </div>

              <div class="device-kpis">
                <div>
                  <span>Ultima leitura</span>
                  <strong>{{ lastReadingLabel }}</strong>
                </div>
                <div>
                  <span>Vazao</span>
                  <strong>{{ activeDevice ? activeDevice.lastFlowRate + ' L/min' : '0 L/min' }}</strong>
                </div>
                <div>
                  <span>Sensor</span>
                  <strong>{{ activeDevice?.sensor?.name || 'Nao definido' }}</strong>
                </div>
              </div>
            </article>

            <article class="chart-card">
              <div class="card-title">
                <div>
                  <h2>Consumo de agua</h2>
                  <p>Ultimas 24 horas</p>
                </div>
                <span class="waiting"><i /> {{ settings.simulationMode ? 'Simulacao ativa' : 'Aguardando dados' }}</span>
              </div>

              <div class="chart" aria-label="Grafico de consumo das ultimas 24 horas">
                <div class="labels">
                  <small>1.5k</small>
                  <small>1k</small>
                  <small>500</small>
                  <small>0</small>
                </div>
                <div class="plot">
                  <i v-for="line in 4" :key="line" />
                  <svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="consumptionFill" x1="0" y1="0" x2="0" y2="1">
                        <stop stop-color="#1ca7a0" stop-opacity="0.24" />
                        <stop offset="1" stop-color="#1ca7a0" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 150 L500 150 L500 150 L0 150Z"
                      fill="url(#consumptionFill)"
                    />
                    <path
                      d="M0 150 L500 150"
                      fill="none"
                      stroke="#1ca7a0"
                      stroke-linecap="round"
                      stroke-width="3"
                    />
                  </svg>
                  <div class="hours">
                    <small>00h</small>
                    <small>06h</small>
                    <small>12h</small>
                    <small>18h</small>
                    <small>Agora</small>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <aside class="side-column">
            <article class="monthly-card">
              <div class="card-title compact">
                <div>
                  <h2>Resumo do mes</h2>
                  <p>Indicadores principais</p>
                </div>
              </div>
              <ListItem v-for="metric in visibleMonthlyMetrics" :key="metric.label" v-bind="metric" @click="openMetricInfo(metric)" />
            </article>

            <article v-if="dashboardGoal" class="target-card">
              <span>{{ dashboardGoal.title }}</span>
              <strong>{{ dashboardGoal.progress }}%</strong>
              <div><i :style="{ width: dashboardGoal.progress + '%' }" /></div>
              <p>{{ dashboardGoal.target }}</p>
            </article>
          </aside>
        </section>

        <Transition name="metric-sheet">
          <div v-if="selectedMetric" class="metric-backdrop" role="presentation" @click.self="closeMetricInfo">
            <section class="metric-panel" role="dialog" aria-modal="true" aria-labelledby="metric-title">
              <button class="close-panel" type="button" aria-label="Fechar detalhes" @click="closeMetricInfo">×</button>
              <span :class="['panel-icon', selectedMetric.color]">
                <ion-icon :icon="selectedMetric.icon" />
              </span>
              <small>Resumo do mes</small>
              <h2 id="metric-title">{{ selectedMetric.label }}</h2>
              <strong>{{ selectedMetric.value }}</strong>
              <p>{{ selectedMetric.description }}</p>

              <div class="insight-box">
                <span>Analise Agua+</span>
                <p>{{ selectedMetric.insight }}</p>
              </div>
            </section>
          </div>
        </Transition>
      </AppShell>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { hardwareChipOutline } from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';
import ListItem from '../components/ListItem.vue';
import MetricCard from '../components/MetricCard.vue';
import { userGoals } from '../data/goals-store.js';
import { dashboardData } from '../data/mock-data.js';
import { formatVolume, getSettings } from '../data/settings-store.js';
import { listDevices } from '../services/device-service.js';
import { getConsumptionReadings } from '../services/reading-service.js';

const selectedMetric = ref(null);
const devices = ref([]);
const devicesError = ref('');
const settings = getSettings();
const consumptionData = getConsumptionReadings(settings);
const dashboardGoal = computed(() => userGoals.value[0] || null);
const todayTotalLiters = computed(() => consumptionData.rawReadings.reduce((total, reading) => {
  const readingDate = new Date(reading.timestamp);
  const today = new Date();
  const isToday =
    readingDate.getDate() === today.getDate() &&
    readingDate.getMonth() === today.getMonth() &&
    readingDate.getFullYear() === today.getFullYear();

  return isToday ? total + reading.liters : total;
}, 0));
const currentConsumption = computed(() => formatVolume(todayTotalLiters.value, settings));
const activeDevice = computed(() => {
  return devices.value.find((device) => device.status === 'Ativo') || devices.value[0] || null;
});
const lastSimulatedReading = computed(() => {
  return consumptionData.rawReadings
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;
});
const heroTitle = computed(() => {
  if (activeDevice.value) {
    return `${activeDevice.value.name} conectado ao painel.`;
  }

  return 'Pronto para receber dados do ESP32.';
});
const heroDescription = computed(() => {
  if (activeDevice.value) {
    return `${activeDevice.value.deviceCode} esta preparado para receber leituras no formato do sensor de vazao.`;
  }

  return dashboardData.target;
});
const dashboardStatus = computed(() => {
  if (devicesError.value) {
    return 'Nao foi possivel carregar dispositivos';
  }

  if (activeDevice.value) {
    return `${activeDevice.value.status} - ${activeDevice.value.deviceCode}`;
  }

  if (settings.anomalyDemo) {
    return 'Cenario de anomalia ativo';
  }

  return settings.simulationMode ? `Simulando a cada ${settings.readingInterval}s` : dashboardData.variation;
});
const deviceSummaryText = computed(() => {
  if (devicesError.value) {
    return 'Confira as permissoes do Firestore.';
  }

  if (!activeDevice.value) {
    return 'Nenhum ESP32 preparado nesta conta.';
  }

  return activeDevice.value.location || activeDevice.value.unit || 'Local ainda nao informado';
});
const lastReadingLabel = computed(() => {
  if (!activeDevice.value) {
    return formatVolume(0, settings);
  }

  if (activeDevice.value.lastReadingAt) {
    return formatVolume(activeDevice.value.lastReadingLiters, settings);
  }

  return formatVolume(lastSimulatedReading.value?.liters || activeDevice.value.lastReadingLiters || 0, settings);
});
const visibleMonthlyMetrics = computed(() => dashboardData.monthly.map((metric) => {
  if (metric.value === '0 L') {
    return { ...metric, value: formatVolume(0, settings) };
  }

  return metric;
}));

const openMetricInfo = (metric) => {
  selectedMetric.value = metric;
};

const closeMetricInfo = () => {
  selectedMetric.value = null;
};

const statusClass = (status = '') => ({
  active: status === 'Ativo',
  waiting: status === 'Aguardando conexao',
  offline: status === 'Offline',
  maintenance: status === 'Manutencao',
});

const loadDashboardDevices = async () => {
  try {
    devicesError.value = '';
    devices.value = await listDevices();
  } catch (error) {
    devicesError.value = 'Nao foi possivel carregar dispositivos.';
    devices.value = [];
  }
};

onMounted(loadDashboardDevices);
</script>

<style scoped>
.hero-strip {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 34%),
    var(--agua-petroleo);
  border-radius: 22px;
  color: var(--agua-branco);
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr auto;
  margin-bottom: 20px;
  overflow: hidden;
  padding: 26px;
  position: relative;
}

.hero-strip::after {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  content: '';
  height: 230px;
  position: absolute;
  right: -92px;
  top: -94px;
  width: 230px;
}

.hero-strip span {
  color: #7de2d9;
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.hero-strip h2 {
  font-size: clamp(22px, 4vw, 34px);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.14;
  margin: 0;
  max-width: 620px;
}

.hero-strip p {
  color: #d3e5e8;
  font-size: 13px;
  margin: 12px 0 0;
}

.hero-strip strong {
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1;
  position: relative;
  z-index: 1;
}

.grid {
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
}

.main-column,
.side-column {
  display: grid;
  gap: 18px;
}

.chart-card,
.device-status-card,
.monthly-card,
.target-card {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  box-shadow: var(--agua-shadow);
  padding: 20px;
}

.device-status-card {
  display: grid;
  gap: 15px;
  padding: 20px;
}

.card-title {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.card-title h2 {
  color: var(--agua-petroleo);
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
}

.card-title p {
  color: var(--agua-suave);
  font-size: 12px;
  margin: 0;
}

.card-title span {
  align-items: center;
  color: #188b84;
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 5px;
  white-space: nowrap;
}

.card-title i {
  background: var(--agua-sucesso);
  border-radius: 50%;
  display: inline-block;
  height: 7px;
  width: 7px;
}

.card-title span.waiting {
  color: var(--agua-suave);
}

.card-title span.waiting i {
  background: var(--agua-suave);
}

.device-badge {
  align-items: center;
  border-radius: 999px;
  color: var(--agua-suave);
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 6px;
  padding: 7px 10px;
  white-space: nowrap;
}

.device-badge i {
  background: currentColor;
  border-radius: 50%;
  height: 7px;
  width: 7px;
}

.device-badge.active {
  background: #eaf9ef;
  color: var(--agua-sucesso);
}

.device-badge.waiting {
  background: #fff7ed;
  color: var(--agua-alerta);
}

.device-badge.offline {
  background: var(--agua-danger-bg);
  color: var(--agua-erro);
}

.device-badge.maintenance {
  background: var(--agua-muted);
  color: var(--agua-petroleo);
}

.device-panel {
  align-items: center;
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 16px;
  display: grid;
  gap: 12px;
  grid-template-columns: auto 1fr auto;
  padding: 14px;
}

.device-icon {
  background: rgba(28, 167, 160, 0.14);
  border-radius: 14px;
  color: var(--agua-petroleo);
  display: grid;
  font-size: 24px;
  height: 48px;
  place-items: center;
  width: 48px;
}

.device-panel strong {
  color: var(--agua-petroleo);
  display: block;
  font-size: 14px;
  margin-bottom: 2px;
}

.device-panel small {
  color: var(--agua-suave);
  display: block;
  font-size: 11px;
  line-height: 1.45;
}

.device-panel a {
  background: var(--agua-petroleo);
  border-radius: 12px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 10px 12px;
  text-decoration: none;
}

.empty-device a {
  background: var(--agua-agua);
  color: #073039;
}

.device-kpis {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.device-kpis div {
  background: #f7fbfb;
  border: 1px solid #edf2f2;
  border-radius: 14px;
  display: grid;
  gap: 5px;
  padding: 12px;
}

.device-kpis span {
  color: var(--agua-suave);
  font-size: 11px;
  font-weight: 700;
}

.device-kpis strong {
  color: var(--agua-petroleo);
  font-size: 13px;
  line-height: 1.35;
}

.chart {
  display: flex;
  height: 260px;
  margin-top: 20px;
}

.labels {
  color: #94a1a5;
  display: flex;
  flex-direction: column;
  font-size: 10px;
  justify-content: space-between;
  padding-bottom: 28px;
  width: 34px;
}

.plot {
  flex: 1;
  padding-bottom: 28px;
  position: relative;
}

.plot > i {
  background: #eaf0f0;
  display: block;
  height: 1px;
  margin-bottom: 60px;
}

.plot svg {
  height: calc(100% - 28px);
  inset: 0 0 28px;
  position: absolute;
  width: 100%;
}

.hours {
  bottom: 0;
  color: #94a1a5;
  display: flex;
  font-size: 10px;
  justify-content: space-between;
  left: 0;
  position: absolute;
  right: 0;
}

.monthly-card {
  padding: 18px 18px 6px;
}

.compact {
  margin-bottom: 2px;
}

.target-card {
  display: grid;
  gap: 10px;
}

.target-card span {
  color: var(--agua-suave);
  font-size: 12px;
  font-weight: 600;
}

.target-card strong {
  color: var(--agua-petroleo);
  font-size: 38px;
  line-height: 1;
}

.target-card div {
  background: #e7eeee;
  border-radius: 999px;
  height: 9px;
  overflow: hidden;
}

.target-card i {
  background: linear-gradient(90deg, var(--agua-agua), var(--agua-sucesso));
  border-radius: inherit;
  display: block;
  height: 100%;
  width: 74%;
}

.target-card p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}


.metric-backdrop {
  align-items: center;
  background: rgba(3, 16, 20, 0.62);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 20;
}

.metric-panel {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 22px;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
  color: var(--agua-texto);
  display: grid;
  gap: 10px;
  max-width: 430px;
  padding: 24px;
  position: relative;
  width: min(100%, 430px);
}

.close-panel {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 12px;
  color: var(--agua-suave);
  cursor: pointer;
  font: 700 22px/1 Poppins, sans-serif;
  height: 38px;
  position: absolute;
  right: 16px;
  top: 16px;
  width: 38px;
}

.panel-icon {
  border-radius: 18px;
  display: grid;
  font-size: 28px;
  height: 62px;
  place-items: center;
  width: 62px;
}

.panel-icon.water {
  background: #e6f6f5;
  color: var(--agua-agua);
}

.panel-icon.success {
  background: #eaf9ef;
  color: var(--agua-sucesso);
}

.panel-icon.alert {
  background: #fff5e5;
  color: var(--agua-alerta);
}

.metric-panel small,
.insight-box span {
  color: var(--agua-suave);
  font-size: 12px;
  font-weight: 700;
}

.metric-panel h2 {
  color: var(--agua-petroleo);
  font-size: 24px;
  margin: 0;
}

.metric-panel strong {
  color: var(--agua-texto);
  font-size: 34px;
  line-height: 1;
}

.metric-panel > p,
.insight-box p {
  color: var(--agua-suave);
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
}

.insight-box {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 16px;
  display: grid;
  gap: 6px;
  margin-top: 6px;
  padding: 14px;
}

.metric-sheet-enter-active,
.metric-sheet-leave-active {
  transition: opacity 0.2s ease;
}

.metric-sheet-enter-active .metric-panel,
.metric-sheet-leave-active .metric-panel {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.metric-sheet-enter-from,
.metric-sheet-leave-to {
  opacity: 0;
}

.metric-sheet-enter-from .metric-panel,
.metric-sheet-leave-to .metric-panel {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .hero-strip {
    grid-template-columns: 1fr;
    padding: 22px;
  }

  .chart {
    height: 210px;
  }

  .chart-card,
  .device-status-card,
  .monthly-card,
  .target-card {
    border-radius: 16px;
    padding: 18px;
  }

  .monthly-card {
    padding-bottom: 6px;
  }

  .device-panel,
  .device-kpis {
    grid-template-columns: 1fr;
  }
}
</style>

