<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Dispositivo" :show-period="false">
        <section v-if="loading" class="state-card">
          <span><ion-icon :icon="hardwareChipOutline" /></span>
          <h2>Carregando dispositivo...</h2>
          <p>Buscando configuracoes, leituras e alertas vinculados.</p>
        </section>

        <section v-else-if="!device" class="state-card">
          <span><ion-icon :icon="alertCircleOutline" /></span>
          <h2>Dispositivo nao encontrado.</h2>
          <p>Ele pode ter sido removido ou ainda nao esta vinculado a esta conta.</p>
          <router-link to="/dispositivos">
            <ion-icon :icon="arrowBackOutline" />
            Voltar para dispositivos
          </router-link>
        </section>

        <template v-else>
          <section class="device-hero">
            <div>
              <router-link class="back-link" to="/dispositivos">
                <ion-icon :icon="arrowBackOutline" />
                Dispositivos
              </router-link>
              <span>Monitor de vazao</span>
              <h2>{{ device.name }}</h2>
              <p>{{ device.location || 'Local de instalacao nao informado' }}</p>
            </div>
            <div class="hero-actions">
              <strong :class="statusClass(device.status)">{{ device.status }}</strong>
              <button type="button" @click="openEditor">
                <ion-icon :icon="createOutline" />
                Editar
              </button>
            </div>
          </section>

          <section class="summary-grid">
            <article>
              <ion-icon :icon="waterOutline" />
              <span>Consumo acumulado</span>
              <strong>{{ formatVolume(device.totalConsumption || totalFromReadings, settings) }}</strong>
            </article>
            <article>
              <ion-icon :icon="analyticsOutline" />
              <span>Ultima vazao</span>
              <strong>{{ lastReading.flowRate || device.lastFlowRate }} L/min</strong>
            </article>
            <article>
              <ion-icon :icon="pulseOutline" />
              <span>Pulsos recentes</span>
              <strong>{{ lastReading.pulseCount || device.lastPulseCount }} pulsos</strong>
            </article>
            <article>
              <ion-icon :icon="radioOutline" />
              <span>Ultima leitura</span>
              <strong>{{ lastReadingLabel }}</strong>
            </article>
          </section>

          <section class="detail-layout">
            <div class="main-column">
              <article class="panel">
                <div class="panel-title">
                  <div>
                    <h2>Leituras do dispositivo</h2>
                    <p>Historico preparado para receber os envios reais do ESP32.</p>
                  </div>
                  <strong>{{ readings.length }} registro{{ readings.length === 1 ? '' : 's' }}</strong>
                </div>

                <div v-if="readings.length" class="readings-list">
                  <div v-for="reading in displayReadings" :key="reading.id" class="reading-item">
                    <span>{{ reading.time }}</span>
                    <strong>{{ formatVolume(reading.liters, settings) }}</strong>
                    <small>{{ reading.flowRate }} L/min</small>
                    <small>{{ reading.pulseCount }} pulsos</small>
                    <em :class="{ anomaly: reading.status === 'anomaly' }">{{ readingStatus(reading.status) }}</em>
                  </div>
                </div>

                <div v-else class="empty-inline">
                  <strong>Nenhuma leitura registrada</strong>
                  <p>Quando o ESP32 enviar dados, eles aparecerao automaticamente aqui.</p>
                </div>
              </article>

              <article class="panel">
                <div class="panel-title">
                  <div>
                    <h2>Alertas e manutencao</h2>
                    <p>Eventos tecnicos vinculados a este ponto de medicao.</p>
                  </div>
                </div>

                <div class="ops-grid">
                  <div>
                    <h3>Alertas</h3>
                    <div v-if="alerts.length" class="ops-list">
                      <span v-for="alert in alerts" :key="alert.id">
                        <strong>{{ alert.title }}</strong>
                        <small>{{ alert.message }}</small>
                      </span>
                    </div>
                    <p v-else>Nenhum alerta ativo para este dispositivo.</p>
                  </div>

                  <div>
                    <h3>Ordens de manutencao</h3>
                    <div v-if="maintenanceOrders.length" class="ops-list">
                      <span v-for="order in maintenanceOrders" :key="order.id">
                        <strong>{{ order.title }}</strong>
                        <small>{{ order.description }}</small>
                      </span>
                    </div>
                    <p v-else>Nenhuma ordem aberta para este dispositivo.</p>
                  </div>
                </div>
              </article>
            </div>

            <aside class="side-panel">
              <article class="panel">
                <h2>Configuracao tecnica</h2>
                <div class="tech-list">
                  <div>
                    <span>ID do dispositivo</span>
                    <strong>{{ device.deviceCode }}</strong>
                  </div>
                  <div>
                    <span>Unidade</span>
                    <strong>{{ device.unit || 'Nao vinculada' }}</strong>
                  </div>
                  <div>
                    <span>Sensor</span>
                    <strong>{{ device.sensor.name }}</strong>
                  </div>
                  <div>
                    <span>Codigo do sensor</span>
                    <strong>{{ device.sensor.sensorCode }}</strong>
                  </div>
                  <div>
                    <span>Calibracao</span>
                    <strong>{{ device.sensor.calibrationFactor }} pulsos/s = 1 L/min</strong>
                  </div>
                  <div>
                    <span>Envio</span>
                    <strong>{{ device.readingInterval }}s</strong>
                  </div>
                </div>
              </article>

              <article class="panel">
                <h2>Status operacional</h2>
                <label>
                  Alterar status
                  <select :value="device.status" @change="changeStatus($event.target.value)">
                    <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
                  </select>
                </label>
              </article>
            </aside>
          </section>
        </template>

        <div v-if="isEditing && editForm" class="modal-backdrop" role="presentation" @click.self="closeEditor">
          <section class="edit-modal" role="dialog" aria-modal="true" aria-labelledby="device-detail-edit-title">
            <div class="modal-title">
              <span><ion-icon :icon="createOutline" /></span>
              <div>
                <h2 id="device-detail-edit-title">Editar dispositivo</h2>
                <p>Atualize os dados que serao usados pela futura integracao com o ESP32.</p>
              </div>
            </div>

            <form class="edit-form" @submit.prevent="saveEdition">
              <label>
                Nome
                <input v-model="editForm.name" type="text" required />
              </label>
              <label>
                Local
                <input v-model="editForm.location" type="text" required />
              </label>
              <label>
                ID do dispositivo
                <input v-model="editForm.deviceCode" type="text" required />
              </label>
              <label>
                Unidade
                <input v-model="editForm.unit" type="text" />
              </label>
              <label>
                Modelo do sensor
                <select v-model="editForm.sensor.name">
                  <option v-for="model in sensorModels" :key="model" :value="model">{{ model }}</option>
                </select>
              </label>
              <label>
                Codigo do sensor
                <input v-model="editForm.sensor.sensorCode" type="text" required />
              </label>
              <label>
                Fator de calibracao
                <input v-model.number="editForm.sensor.calibrationFactor" type="number" min="0.1" step="0.1" required />
              </label>
              <label>
                Intervalo de envio
                <select v-model.number="editForm.readingInterval">
                  <option :value="5">5 segundos</option>
                  <option :value="10">10 segundos</option>
                  <option :value="30">30 segundos</option>
                  <option :value="60">60 segundos</option>
                </select>
              </label>
              <label>
                Status
                <select v-model="editForm.status">
                  <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
                </select>
              </label>

              <div class="modal-actions">
                <button class="secondary-action" type="button" @click="closeEditor">Cancelar</button>
                <button class="primary-action" type="submit">
                  <ion-icon :icon="saveOutline" />
                  Salvar
                </button>
              </div>
            </form>
          </section>
        </div>
      </AppShell>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  alertCircleOutline,
  analyticsOutline,
  arrowBackOutline,
  createOutline,
  hardwareChipOutline,
  pulseOutline,
  radioOutline,
  saveOutline,
  waterOutline,
} from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';
import { formatVolume, getSettings } from '../data/settings-store.js';
import {
  DEVICE_STATUSES,
  SENSOR_MODELS,
  getDeviceById,
  listDeviceAlerts,
  listDeviceMaintenanceOrders,
  listDeviceReadings,
  updateDevice,
  updateDeviceStatus,
} from '../services/device-service.js';

const route = useRoute();
const device = ref(null);
const readings = ref([]);
const alerts = ref([]);
const maintenanceOrders = ref([]);
const loading = ref(true);
const isEditing = ref(false);
const editForm = ref(null);
const settings = getSettings();
const statuses = DEVICE_STATUSES;
const sensorModels = SENSOR_MODELS;

const deviceId = computed(() => String(route.params.id || ''));
const sortedReadings = computed(() =>
  readings.value.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
);
const lastReading = computed(() => sortedReadings.value[0] || {});
const totalFromReadings = computed(() => readings.value.reduce((sum, reading) => sum + Number(reading.liters || 0), 0));
const lastReadingLabel = computed(() => {
  if (!lastReading.value.timestamp) {
    return 'Aguardando';
  }

  return new Date(lastReading.value.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
});
const displayReadings = computed(() =>
  sortedReadings.value.slice(0, 8).map((reading) => ({
    ...reading,
    time: new Date(reading.timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  })),
);

const loadDevice = async () => {
  loading.value = true;
  device.value = await getDeviceById(deviceId.value);

  if (device.value) {
    readings.value = await listDeviceReadings(deviceId.value);
    alerts.value = await listDeviceAlerts(deviceId.value);
    maintenanceOrders.value = await listDeviceMaintenanceOrders(deviceId.value);
  }

  loading.value = false;
};

const openEditor = () => {
  if (!device.value) {
    return;
  }

  editForm.value = {
    name: device.value.name,
    deviceCode: device.value.deviceCode,
    location: device.value.location,
    unit: device.value.unit,
    status: device.value.status,
    readingInterval: device.value.readingInterval,
    sensor: {
      name: device.value.sensor.name,
      sensorCode: device.value.sensor.sensorCode,
      type: device.value.sensor.type,
      calibrationFactor: device.value.sensor.calibrationFactor,
    },
  };
  isEditing.value = true;
};

const closeEditor = () => {
  isEditing.value = false;
  editForm.value = null;
};

const saveEdition = async () => {
  if (!editForm.value) {
    return;
  }

  await updateDevice(deviceId.value, editForm.value);
  closeEditor();
  await loadDevice();
};

const changeStatus = async (status) => {
  await updateDeviceStatus(deviceId.value, status);
  await loadDevice();
};

const statusClass = (status) => ({
  active: status === 'Ativo',
  offline: status === 'Offline',
  waiting: status === 'Aguardando conexao',
  maintenance: status === 'Manutencao',
});

const readingStatus = (status) => {
  if (status === 'anomaly') {
    return 'Fora do padrao';
  }

  if (status === 'waiting') {
    return 'Aguardando';
  }

  return 'Normal';
};

onMounted(loadDevice);
</script>

<style scoped>
.state-card,
.device-hero,
.panel,
.summary-grid article {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  box-shadow: var(--agua-shadow);
}

.state-card {
  border-radius: 18px;
  display: grid;
  gap: 10px;
  max-width: 620px;
  padding: 22px;
}

.state-card span {
  background: var(--agua-muted);
  border-radius: 16px;
  color: var(--agua-petroleo);
  display: grid;
  font-size: 27px;
  height: 54px;
  place-items: center;
  width: 54px;
}

.state-card h2,
.panel h2,
.device-hero h2 {
  color: var(--agua-petroleo);
  margin: 0;
}

.state-card p,
.device-hero p,
.panel p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
}

.state-card a,
.back-link {
  align-items: center;
  color: var(--agua-petroleo);
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  gap: 7px;
  text-decoration: none;
}

.device-hero {
  align-items: end;
  border-radius: 22px;
  display: grid;
  gap: 18px;
  grid-template-columns: 1fr auto;
  margin-bottom: 18px;
  padding: 24px;
}

.device-hero span {
  color: var(--agua-agua);
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin: 16px 0 8px;
}

.device-hero h2 {
  font-size: clamp(25px, 4vw, 36px);
  line-height: 1.12;
}

.hero-actions {
  align-items: end;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: end;
}

.hero-actions strong {
  border-radius: 999px;
  font-size: 11px;
  padding: 8px 11px;
}

.hero-actions strong.active {
  background: #eaf9ef;
  color: var(--agua-sucesso);
}

.hero-actions strong.offline {
  background: var(--agua-danger-bg);
  color: var(--agua-erro);
}

.hero-actions strong.waiting {
  background: #fff7ed;
  color: var(--agua-alerta);
}

.hero-actions strong.maintenance {
  background: var(--agua-muted);
  color: var(--agua-petroleo);
}

.hero-actions button,
.primary-action,
.secondary-action {
  align-items: center;
  border-radius: 14px;
  cursor: pointer;
  display: inline-flex;
  font: 700 13px Poppins, sans-serif;
  gap: 8px;
  min-height: 44px;
  padding: 0 15px;
}

.hero-actions button,
.primary-action {
  background: var(--agua-petroleo);
  border: 1px solid var(--agua-petroleo);
  color: #ffffff;
}

.summary-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 18px;
}

.summary-grid article {
  border-radius: 18px;
  display: grid;
  gap: 7px;
  padding: 18px;
}

.summary-grid ion-icon {
  background: var(--agua-muted);
  border-radius: 12px;
  color: var(--agua-petroleo);
  font-size: 21px;
  padding: 9px;
}

.summary-grid span,
.tech-list span {
  color: var(--agua-suave);
  font-size: 11px;
  font-weight: 700;
}

.summary-grid strong,
.tech-list strong {
  color: var(--agua-petroleo);
  font-size: 14px;
}

.detail-layout {
  align-items: start;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) 330px;
}

.main-column {
  display: grid;
  gap: 18px;
}

.panel {
  border-radius: 18px;
  display: grid;
  gap: 15px;
  padding: 18px;
}

.panel-title {
  align-items: start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.panel-title h2,
.panel h2 {
  font-size: 18px;
}

.panel-title strong {
  background: var(--agua-muted);
  border-radius: 999px;
  color: var(--agua-petroleo);
  font-size: 11px;
  padding: 7px 10px;
  white-space: nowrap;
}

.readings-list {
  display: grid;
  gap: 8px;
}

.reading-item {
  align-items: center;
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 12px;
  display: grid;
  gap: 10px;
  grid-template-columns: 1.2fr 0.8fr 0.8fr 0.9fr auto;
  min-height: 48px;
  padding: 0 12px;
}

.reading-item span,
.reading-item small {
  color: var(--agua-suave);
  font-size: 11px;
}

.reading-item strong {
  color: var(--agua-petroleo);
  font-size: 13px;
}

.reading-item em {
  background: rgba(28, 167, 160, 0.12);
  border-radius: 999px;
  color: var(--agua-petroleo);
  font-size: 11px;
  font-style: normal;
  font-weight: 700;
  padding: 6px 9px;
  text-align: center;
}

.reading-item em.anomaly {
  background: var(--agua-danger-bg);
  color: var(--agua-erro);
}

.empty-inline {
  background: var(--agua-muted);
  border: 1px dashed var(--agua-borda);
  border-radius: 14px;
  padding: 16px;
}

.empty-inline strong {
  color: var(--agua-petroleo);
  display: block;
  font-size: 13px;
  margin-bottom: 4px;
}

.ops-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ops-grid h3 {
  color: var(--agua-petroleo);
  font-size: 14px;
  margin: 0 0 10px;
}

.ops-grid p {
  background: var(--agua-muted);
  border-radius: 12px;
  padding: 12px;
}

.ops-list {
  display: grid;
  gap: 8px;
}

.ops-list span {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 12px;
  display: grid;
  gap: 4px;
  padding: 12px;
}

.ops-list strong {
  color: var(--agua-petroleo);
  font-size: 13px;
}

.ops-list small {
  color: var(--agua-suave);
  font-size: 11px;
  line-height: 1.5;
}

.side-panel {
  display: grid;
  gap: 18px;
  position: sticky;
  top: 18px;
}

.tech-list {
  display: grid;
  gap: 9px;
}

.tech-list div {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 12px;
  display: grid;
  gap: 4px;
  padding: 12px;
}

label {
  color: var(--agua-texto);
  display: grid;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
}

select,
input {
  background: var(--agua-branco);
  border: 1px solid var(--agua-input-border);
  border-radius: 14px;
  color: var(--agua-texto);
  font: 600 13px Poppins, sans-serif;
  min-height: 46px;
  outline: none;
  padding: 0 12px;
}

.modal-backdrop {
  align-items: center;
  background: rgba(3, 16, 20, 0.64);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 20;
}

.edit-modal {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 22px;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
  color: var(--agua-texto);
  display: grid;
  gap: 14px;
  max-width: 720px;
  padding: 24px;
  width: min(100%, 720px);
}

.modal-title {
  align-items: center;
  display: flex;
  gap: 14px;
}

.modal-title span {
  background: rgba(28, 167, 160, 0.14);
  border: 1px solid rgba(28, 167, 160, 0.24);
  border-radius: 18px;
  color: var(--agua-petroleo);
  display: grid;
  font-size: 28px;
  height: 58px;
  place-items: center;
  width: 58px;
}

.modal-title h2 {
  color: var(--agua-petroleo);
  font-size: 22px;
  margin: 0;
}

.modal-title p {
  color: var(--agua-suave);
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
}

.edit-form {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  grid-column: 1 / -1;
  justify-content: flex-end;
}

.secondary-action {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  color: var(--agua-texto);
}

@media (max-width: 980px) {
  .device-hero,
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    justify-content: start;
  }

  .summary-grid,
  .ops-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .side-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .summary-grid,
  .ops-grid,
  .edit-form {
    grid-template-columns: 1fr;
  }

  .reading-item {
    align-items: start;
    grid-template-columns: 1fr;
    padding: 12px;
  }
}
</style>
