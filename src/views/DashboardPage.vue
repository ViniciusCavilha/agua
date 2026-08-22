<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Dashboard">
        <section class="hero-strip">
          <div>
            <span>Resumo operacional</span>
            <h2>{{ heroTitle }}</h2>
            <p>{{ heroDescription }}</p>
            <router-link v-if="heroActionLabel" class="hero-action" to="/dispositivos">
              {{ heroActionLabel }}
            </router-link>
          </div>
          <strong>{{ currentConsumption }}</strong>
        </section>

        <section class="grid">
          <div class="main-column">
            <MetricCard title="Consumo hoje" :value="currentConsumption" :variation="dashboardStatus" trend="neutral" />
            <article v-if="activeDevice" class="device-status-card">
              <div class="card-title">
                <div>
                  <h2>Dispositivo principal</h2>
                  <p>{{ deviceSummaryText }}</p>
                </div>
                <span :class="['device-badge', statusClass(activeDevice?.status)]">
                  <i />
                  {{ activeDevice?.status || 'Não vinculado' }}
                </span>
              </div>

              <div class="device-panel">
                <span class="device-icon"><ion-icon :icon="hardwareChipOutline" /></span>
                <div>
                  <strong>{{ activeDevice.name }}</strong>
                  <small>{{ activeDevice.deviceCode }}</small>
                </div>
                <router-link to="/dispositivos">Gerenciar</router-link>
              </div>

              <div class="device-kpis">
                <div>
                  <span>Última leitura</span>
                  <strong>{{ lastReadingLabel }}</strong>
                </div>
                <div>
                  <span>Vazão</span>
                  <strong>{{ activeDeviceFlowRate }}</strong>
                </div>
                <div>
                  <span>Sensor</span>
                  <strong>{{ activeDevice?.sensor?.name || 'Não definido' }}</strong>
                </div>
              </div>

              <router-link v-if="hasMoreDevices" class="more-devices-link" to="/dispositivos">
                Ver outros dispositivos
              </router-link>
            </article>

            <article class="chart-card">
              <div class="card-title">
                <div>
                  <h2>Consumo de água</h2>
                  <p>Últimas 24 horas</p>
                </div>
                <span :class="['chart-status', settings.presentationMode ? 'simulation' : 'realtime']">
                  <i /> {{ settings.presentationMode ? 'Simulação ativa' : 'Em tempo real' }}
                </span>
              </div>

              <div
                v-if="hasHourlyData"
                class="hourly-chart"
                aria-label="Gráfico de consumo por horário nas últimas 24 horas"
              >
                <button
                  v-for="bar in dailyHourlyBars"
                  :key="bar.hour"
                  class="hourly-bar"
                  :class="{ active: activeHour === bar.hour }"
                  type="button"
                  :aria-label="`${bar.hour}: ${bar.formattedValue}`"
                  @click="toggleActiveHour(bar.hour)"
                  @focus="activeHour = bar.hour"
                  @blur="activeHour = ''"
                  @mouseenter="activeHour = bar.hour"
                  @mouseleave="activeHour = ''"
                >
                  <span class="bar-value">{{ bar.formattedValue }}</span>
                  <span class="bar-track">
                    <i :class="{ empty: !bar.liters }" :style="{ height: `${bar.height}%` }" />
                  </span>
                  <small>{{ bar.hour }}</small>
                </button>
              </div>
              <div v-else class="hourly-chart-empty" role="status">
                <span><i /></span>
                <strong>Aguardando leituras dos medidores</strong>
                <p>As barras aparecerão automaticamente quando o primeiro dado de consumo for recebido.</p>
              </div>
            </article>
          </div>

          <aside class="side-column">
            <article class="technical-alert-card">
              <div class="card-title compact">
                <div>
                  <h2>Alertas técnicos</h2>
                  <p>Status operacional dos dispositivos</p>
                </div>
                <span :class="['alert-counter', technicalAlerts.length ? 'has-alerts' : '']">
                  {{ technicalAlerts.length }}
                </span>
              </div>

              <div v-if="technicalAlerts.length" class="technical-alert-list">
                <router-link
                  v-for="alert in visibleTechnicalAlerts"
                  :key="alert.id"
                  class="technical-alert"
                  :class="alert.severity"
                  :to="alert.deviceId ? '/dispositivos' : '/consumo'"
                >
                  <ion-icon :icon="alert.severity === 'critical' ? warningOutline : alertCircleOutline" />
                  <div>
                    <strong>{{ alert.title }}</strong>
                    <small>{{ alert.deviceCode || alert.deviceName }}</small>
                  </div>
                </router-link>
              </div>

              <div v-else class="no-technical-alerts">
                <ion-icon :icon="shieldCheckmarkOutline" />
                <div>
                  <strong>Nenhum alerta ativo</strong>
                  <small>O app está pronto para destacar falhas quando as leituras chegarem.</small>
                </div>
              </div>
            </article>

            <article class="monthly-card">
              <div class="card-title compact">
                <div>
                  <h2>Resumo do mês</h2>
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
              <small>Resumo do mês</small>
              <h2 id="metric-title">{{ selectedMetric.label }}</h2>
              <strong>{{ selectedMetric.value }}</strong>
              <p>{{ selectedMetric.description }}</p>

              <div class="insight-box">
                <span>Análise Água+</span>
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { alertCircleOutline, hardwareChipOutline, shieldCheckmarkOutline, warningOutline } from 'ionicons/icons';
import { useRoute } from 'vue-router';
import AppShell from '../components/AppShell.vue';
import ListItem from '../components/ListItem.vue';
import MetricCard from '../components/MetricCard.vue';
import { userGoals } from '../data/goals-store.js';
import { dashboardData } from '../data/mock-data.js';
import { formatVolume, getSettings, onSettingsChange } from '../data/settings-store.js';
import { getCurrentUser, watchAuthUser } from '../services/firebase.js';
import { listDevices } from '../services/device-service.js';
import { getConsumptionReadings } from '../services/reading-service.js';
import { generateTechnicalAlerts, syncTechnicalAlertNotifications } from '../services/technical-alert-service.js';

const selectedMetric = ref(null);
const activeHour = ref('');
const route = useRoute();
const devices = ref([]);
const devicesError = ref('');
let stopAuthListener = null;
let stopSettingsListener = null;
const settings = ref(getSettings());
const consumptionData = ref(getConsumptionReadings(settings.value, devices.value));
const dashboardGoal = computed(() => userGoals.value[0] || null);
const todayTotalLiters = computed(() => consumptionData.value.rawReadings.reduce((total, reading) => {
  const readingDate = new Date(reading.timestamp);
  const today = new Date();
  const isToday =
    readingDate.getDate() === today.getDate() &&
    readingDate.getMonth() === today.getMonth() &&
    readingDate.getFullYear() === today.getFullYear();

  return isToday ? total + reading.liters : total;
}, 0));
const currentConsumption = computed(() => formatVolume(todayTotalLiters.value, settings.value));
const activeDevice = computed(() => {
  return devices.value.find((device) => device.status === 'Ativo') || null;
});
const hasMoreDevices = computed(() => devices.value.length > 1);
const deviceCount = computed(() => devices.value.length);
const technicalAlerts = computed(() =>
  generateTechnicalAlerts({
    devices: devices.value,
    readings: consumptionData.value.rawReadings,
    settings: settings.value,
  }),
);
const visibleTechnicalAlerts = computed(() => technicalAlerts.value.slice(0, 3));
const lastSimulatedReading = computed(() => {
  return consumptionData.value.rawReadings
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null;
});
const activeDeviceReadings = computed(() => {
  if (!activeDevice.value) {
    return [];
  }

  return consumptionData.value.rawReadings.filter((reading) => reading.deviceId === activeDevice.value.id);
});
const lastActiveDeviceReading = computed(() =>
  activeDeviceReadings.value
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || null,
);
const heroTitle = computed(() => {
  if (deviceCount.value > 1) {
    return `${deviceCount.value} dispositivos conectados ao painel.`;
  }

  if (deviceCount.value === 1) {
    return `${devices.value[0].name} conectado ao painel.`;
  }

  return 'Pronto para receber dados do ESP32.';
});
const heroDescription = computed(() => {
  if (deviceCount.value > 1) {
    return 'Visualize todos os dispositivos preparados para receber leituras do ESP32.';
  }

  if (deviceCount.value === 1) {
    return `${devices.value[0].deviceCode} está preparado para receber leituras no formato do sensor de vazão.`;
  }

  return dashboardData.target;
});
const heroActionLabel = computed(() => {
  if (deviceCount.value > 1) {
    return 'Ver todos os dispositivos';
  }

  if (deviceCount.value === 1) {
    return 'Visualizar dispositivo';
  }

  return '';
});
const dashboardStatus = computed(() => {
  if (devicesError.value) {
    return 'Não foi possível carregar dispositivos';
  }

  if (activeDevice.value) {
    return `${activeDevice.value.status} - ${activeDevice.value.deviceCode}`;
  }

  if (settings.value.anomalyDemo) {
    return 'Cenário de anomalia ativo';
  }

  if (settings.value.presentationMode) {
    return 'Modo apresentação ativo';
  }

  return settings.value.simulationMode ? `Simulando a cada ${settings.value.readingInterval}s` : dashboardData.variation;
});
const deviceSummaryText = computed(() => {
  if (devicesError.value) {
    return 'Confira as permissões do Firestore.';
  }

  if (!activeDevice.value) {
    return 'Nenhum ESP32 preparado nesta conta.';
  }

  return activeDevice.value.location || activeDevice.value.unit || 'Local ainda não informado';
});
const lastReadingLabel = computed(() => {
  if (!activeDevice.value) {
    return formatVolume(0, settings.value);
  }

  if (lastActiveDeviceReading.value) {
    return formatVolume(lastActiveDeviceReading.value.liters, settings.value);
  }

  return formatVolume(activeDevice.value.lastReadingLiters || lastSimulatedReading.value?.liters || 0, settings.value);
});
const activeDeviceFlowRate = computed(() => {
  if (!activeDevice.value) {
    return '0 L/min';
  }

  return `${lastActiveDeviceReading.value?.flowRate ?? activeDevice.value.lastFlowRate ?? 0} L/min`;
});
const visibleMonthlyMetrics = computed(() => dashboardData.monthly.map((metric) => {
  if (metric.value === '0 L') {
    return { ...metric, value: formatVolume(0, settings.value) };
  }

  return metric;
}));
const dailyHourlyBars = computed(() => consumptionData.value.dailyHourlyBars || []);
const hasHourlyData = computed(() => dailyHourlyBars.value.some((bar) => Number(bar.liters) > 0));

const toggleActiveHour = (hour) => {
  activeHour.value = activeHour.value === hour ? '' : hour;
};

const openMetricInfo = (metric) => {
  selectedMetric.value = metric;
};

const closeMetricInfo = () => {
  selectedMetric.value = null;
};

const statusClass = (status = '') => ({
  active: status === 'Ativo',
  waiting: status === 'Aguardando conexão',
  offline: status === 'Offline',
  maintenance: status === 'Manutenção',
});

const loadDashboardDevices = async () => {
  settings.value = getSettings();

  try {
    devicesError.value = '';
    devices.value = await listDevices();
    consumptionData.value = getConsumptionReadings(settings.value, devices.value);
    syncTechnicalAlertNotifications(technicalAlerts.value);
  } catch (error) {
    devicesError.value = 'Não foi possível carregar dispositivos.';
    devices.value = [];
    consumptionData.value = getConsumptionReadings(settings.value, []);
  }
};

const refreshDashboardDevices = () => {
  loadDashboardDevices();
};

const refreshDashboardSettings = (nextSettings = getSettings()) => {
  settings.value = nextSettings;
  consumptionData.value = getConsumptionReadings(nextSettings, devices.value);
  syncTechnicalAlertNotifications(technicalAlerts.value);
};

onIonViewWillEnter(loadDashboardDevices);

onMounted(() => {
  stopAuthListener = watchAuthUser(() => {
    loadDashboardDevices();
  });

  if (getCurrentUser()) {
    loadDashboardDevices();
  }

  window.addEventListener('focus', refreshDashboardDevices);
  stopSettingsListener = onSettingsChange(refreshDashboardSettings);
});

watch(
  () => route.path,
  (path) => {
    if (path === '/dashboard') {
      loadDashboardDevices();
    }
  },
);

onUnmounted(() => {
  stopAuthListener?.();
  stopSettingsListener?.();
  window.removeEventListener('focus', refreshDashboardDevices);
});
</script>

<style scoped>
.hero-strip {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 34%),
    var(--agua-feature-bg);
  border-radius: 22px;
  color: var(--agua-feature-text);
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

.hero-strip > div {
  position: relative;
  z-index: 1;
}

.hero-strip span {
  color: #c9edf1 !important;
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.hero-strip h2 {
  color: var(--agua-feature-text) !important;
  font-size: clamp(22px, 4vw, 34px);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.14;
  margin: 0;
  max-width: 620px;
}

.hero-strip p {
  color: #c9edf1 !important;
  font-size: 13px;
  margin: 12px 0 0;
}

.hero-action {
  align-items: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  color: #ffffff !important;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  margin-top: 16px;
  min-height: 40px;
  padding: 0 13px;
  text-decoration: none;
}

.hero-strip strong {
  color: var(--agua-feature-text) !important;
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
.technical-alert-card,
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

.card-title .chart-status.realtime {
  color: var(--agua-sucesso);
}

.card-title .chart-status.realtime i {
  background: var(--agua-sucesso);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--agua-sucesso) 16%, transparent);
}

.card-title .chart-status.simulation {
  color: var(--agua-suave);
}

.card-title .chart-status.simulation i {
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

.device-kpis {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.more-devices-link {
  background: transparent;
  border: 1px solid var(--agua-borda);
  border-radius: 12px;
  color: var(--agua-petroleo);
  font-size: 12px;
  font-weight: 700;
  justify-self: start;
  padding: 10px 12px;
  text-decoration: none;
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

.hourly-chart {
  align-items: end;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(33.333% - 1px),
    var(--agua-borda) calc(33.333% - 1px),
    var(--agua-borda) 33.333%
  );
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(8, minmax(34px, 1fr));
  height: 250px;
  margin-top: 22px;
  padding: 12px 8px 0;
}

.hourly-chart-empty {
  align-content: center;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(33.333% - 1px),
    var(--agua-borda) calc(33.333% - 1px),
    var(--agua-borda) 33.333%
  );
  display: grid;
  gap: 7px;
  height: 250px;
  justify-items: center;
  margin-top: 22px;
  padding: 24px;
  text-align: center;
}

.hourly-chart-empty > span {
  align-items: end;
  border-bottom: 2px solid var(--agua-borda);
  display: flex;
  gap: 4px;
  height: 34px;
  justify-content: center;
  width: 54px;
}

.hourly-chart-empty > span::before,
.hourly-chart-empty > span::after,
.hourly-chart-empty > span i {
  background: color-mix(in srgb, var(--agua-agua) 24%, transparent);
  border-radius: 4px 4px 0 0;
  content: '';
  display: block;
  width: 8px;
}

.hourly-chart-empty > span::before {
  height: 13px;
}

.hourly-chart-empty > span i {
  height: 25px;
}

.hourly-chart-empty > span::after {
  height: 18px;
}

.hourly-chart-empty strong {
  color: var(--agua-petroleo);
  font-size: 13px;
}

.hourly-chart-empty p {
  color: var(--agua-suave);
  font-size: 11px;
  line-height: 1.55;
  margin: 0;
  max-width: 360px;
}

.hourly-bar {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--agua-suave);
  cursor: pointer;
  display: grid;
  gap: 8px;
  grid-template-rows: 26px 1fr 20px;
  height: 100%;
  justify-items: center;
  min-width: 0;
  padding: 0;
}

.bar-value {
  background: var(--agua-petroleo);
  border-radius: 999px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  opacity: 0;
  padding: 5px 8px;
  transform: translateY(5px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  white-space: nowrap;
  z-index: 2;
}

.bar-track {
  align-items: end;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.bar-track i {
  background: linear-gradient(180deg, var(--agua-agua), var(--agua-petroleo));
  border-radius: 999px 999px 5px 5px;
  display: block;
  min-height: 8px;
  transition: filter 0.18s ease, height 0.35s ease, transform 0.18s ease;
  width: min(100%, 32px);
}

.bar-track i.empty {
  background: color-mix(in srgb, var(--agua-agua) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--agua-agua) 28%, transparent);
}

.hourly-bar small {
  color: var(--agua-suave);
  font-size: 10px;
  font-weight: 700;
}

.hourly-bar:hover .bar-value,
.hourly-bar:focus-visible .bar-value,
.hourly-bar.active .bar-value {
  opacity: 1;
  transform: translateY(0);
}

.hourly-bar:hover .bar-track i,
.hourly-bar:focus-visible .bar-track i,
.hourly-bar.active .bar-track i {
  filter: drop-shadow(0 8px 12px rgba(28, 167, 160, 0.28));
  transform: translateY(-3px);
}

.hourly-bar:focus-visible {
  border-radius: 8px;
  outline: 2px solid var(--agua-agua);
  outline-offset: 3px;
}

.monthly-card {
  padding: 18px 18px 6px;
}

.technical-alert-card {
  display: grid;
  gap: 12px;
  padding: 18px;
}

.compact {
  margin-bottom: 2px;
}

.card-title .alert-counter {
  background: var(--agua-muted);
  border-radius: 999px;
  color: var(--agua-suave);
  display: grid;
  font-size: 12px;
  font-weight: 800;
  height: 30px;
  place-items: center;
  width: 30px;
}

.card-title .alert-counter.has-alerts {
  background: var(--agua-danger-bg);
  color: var(--agua-erro);
}

.technical-alert-list {
  display: grid;
  gap: 9px;
}

.technical-alert,
.no-technical-alerts {
  align-items: center;
  border-radius: 14px;
  display: grid;
  gap: 10px;
  grid-template-columns: auto 1fr;
  padding: 12px;
  text-decoration: none;
}

.technical-alert {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  color: var(--agua-texto);
}

.technical-alert.critical {
  background: var(--agua-danger-bg);
  border-color: var(--agua-danger-border);
}

.technical-alert.warning {
  background: #fff7ed;
  border-color: #fed7aa;
}

.technical-alert ion-icon,
.no-technical-alerts ion-icon {
  border-radius: 12px;
  font-size: 21px;
  padding: 8px;
}

.technical-alert.critical ion-icon {
  background: rgba(230, 57, 70, 0.12);
  color: var(--agua-erro);
}

.technical-alert.warning ion-icon {
  background: rgba(245, 158, 11, 0.14);
  color: var(--agua-alerta);
}

.technical-alert strong,
.no-technical-alerts strong {
  color: var(--agua-petroleo);
  display: block;
  font-size: 12px;
  margin-bottom: 2px;
}

.technical-alert small,
.no-technical-alerts small {
  color: var(--agua-suave);
  display: block;
  font-size: 11px;
  line-height: 1.45;
}

.no-technical-alerts {
  background: #f7fbfb;
  border: 1px dashed #cfe2e5;
}

.no-technical-alerts ion-icon {
  background: #eaf9ef;
  color: var(--agua-sucesso);
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

  .hourly-chart {
    gap: 7px;
    height: 220px;
    overflow-x: auto;
    padding-inline: 4px;
  }

  .hourly-chart-empty {
    height: 220px;
  }

  .bar-value {
    font-size: 9px;
    padding-inline: 6px;
  }

  .chart-card,
  .device-status-card,
  .monthly-card,
  .technical-alert-card,
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

