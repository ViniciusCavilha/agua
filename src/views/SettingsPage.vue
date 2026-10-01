<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Configurações" mobile-title="Config." :show-period="false">
        <section class="settings-layout">
          <aside class="summary-panel">
            <div class="summary-icon"><ion-icon :icon="settingsOutline" /></div>
            <h2>Configuração ativa</h2>
            <div class="summary-list">
              <div v-for="item in summaryRows" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <div class="actions">
              <button class="save-action" type="button" @click="saveAppSettings">
                <ion-icon :icon="saveOutline" />
                Salvar configurações
              </button>
              <button class="reset-action" type="button" @click="restoreDefaults">
                <ion-icon :icon="refreshOutline" />
                Restaurar padrão
              </button>
              <button class="reset-action" type="button" @click="openDefaultPeriod">
                <ion-icon :icon="openOutline" />
                Abrir período padrão
              </button>
            </div>
          </aside>

          <article class="settings-panel">
            <div class="panel-title">
              <div>
                <h2>Aparência</h2>
                <p>Ajustes visuais do aplicativo neste dispositivo.</p>
              </div>
              <span v-if="saved" class="saved-pill">
                <ion-icon :icon="checkmarkCircleOutline" />
                Salvo
              </span>
            </div>

            <button class="theme-row" type="button" @click="changeTheme">
              <span><ion-icon :icon="isDark ? sunnyOutline : moonOutline" /></span>
              <div>
                <strong>{{ isDark ? 'Tema claro' : 'Tema escuro' }}</strong>
                <small>Alternar entre visual claro e escuro.</small>
              </div>
            </button>

            <label class="switch-row">
              <span>
                Modo compacto
                <small>Reduz espaços em listas e painéis para caber mais informação.</small>
              </span>
              <input v-model="settings.compactMode" type="checkbox" />
            </label>
          </article>

          <article class="settings-panel">
            <div class="panel-title">
              <div>
                <h2>Notificações</h2>
                <p>Defina como alertas e resumos devem aparecer.</p>
              </div>
            </div>

            <div class="stack">
              <label class="switch-row">
                <span>
                  Alertas por e-mail
                  <small>Enviar avisos quando o consumo sair do padrão.</small>
                </span>
                <input v-model="settings.emailAlerts" type="checkbox" />
              </label>

              <label class="switch-row">
                <span>
                  Notificações push
                  <small>{{ pushStatus }}</small>
                </span>
                <input :checked="settings.pushAlerts" type="checkbox" @change="togglePushAlerts" />
              </label>

              <label class="switch-row">
                <span>
                  Resumo semanal
                  <small>Preparar uma visão consolidada toda semana.</small>
                </span>
                <input v-model="settings.weeklySummary" type="checkbox" />
              </label>
            </div>
          </article>

          <article class="settings-panel">
            <div class="panel-title">
              <div>
                <h2>Leituras e simulação</h2>
                <p>Controles para usar dados simulados até conectar o hidrometro.</p>
              </div>
            </div>

            <div class="stack">
              <div class="presentation-box" :class="{ active: settings.presentationMode }">
                <div>
                  <strong>Modo apresentação</strong>
                  <small>Preenche a demonstração com leituras realistas, alerta simulado e intervalo rapido.</small>
                </div>
                <button type="button" @click="togglePresentationMode">
                  <ion-icon :icon="sparklesOutline" />
                  {{ settings.presentationMode ? 'Desativar' : 'Ativar' }}
                </button>
              </div>

              <label class="switch-row">
                <span>
                  Modo simulação
                  <small>Usar leituras simuladas enquanto nao houver hardware conectado.</small>
                </span>
                <input :checked="settings.simulationMode" type="checkbox" @change="syncSimulationMode" />
              </label>

              <label class="switch-row">
                <span>
                  Cenário de anomalia
                  <small>Forçar vazamento/consumo fora do horário em demonstrações.</small>
                </span>
                <input v-model="settings.anomalyDemo" type="checkbox" :disabled="!settings.simulationMode" />
              </label>

              <label class="range-row">
                <span>
                  Intervalo de leitura
                  <small>Frequência usada para atualizar as leituras dos medidores.</small>
                </span>
                <span class="range-control">
                  <span class="range-current">
                    <strong>{{ settings.readingInterval }}</strong>
                    <small>segundos</small>
                  </span>
                  <input
                    v-model.number="settings.readingInterval"
                    :style="readingIntervalStyle"
                    aria-label="Intervalo de leitura em segundos"
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                  />
                  <span class="range-limits" aria-hidden="true">
                    <small>5s</small>
                    <small>60s</small>
                  </span>
                </span>
              </label>
            </div>
          </article>

          <article class="settings-panel">
            <div class="panel-title">
              <div>
                <h2>Padroes do painel</h2>
                <p>Preferencias usadas nas telas de consumo e relatorios.</p>
              </div>
            </div>

            <div class="field-grid">
              <label>
                Período padrão
                <select v-model="settings.defaultPeriod">
                  <option>Diario</option>
                  <option>Semanal</option>
                  <option>Mensal</option>
                </select>
              </label>

              <label>
                Unidade de medida
                <select v-model="settings.measurementUnit">
                  <option>Litros</option>
                  <option>Metros cubicos</option>
                </select>
              </label>
            </div>
          </article>
        </section>
      </AppShell>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  checkmarkCircleOutline,
  moonOutline,
  openOutline,
  refreshOutline,
  saveOutline,
  settingsOutline,
  sparklesOutline,
  sunnyOutline,
} from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';
import { updateAccount } from '../data/account-store.js';
import {
  disablePresentationMode,
  enablePresentationMode,
  getDefaultPeriodRoute,
  getSettings,
  resetSettings,
  saveSettings,
  setSimulationMode,
} from '../data/settings-store.js';
import { getSavedTheme, toggleTheme } from '../data/theme-store.js';
import { syncCurrentUserProfile } from '../services/firebase.js';

const router = useRouter();
const settings = reactive(getSettings());
const saved = ref(false);
const isDark = ref(getSavedTheme() === 'dark');
const pushPermission = ref(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
const readingIntervalStyle = computed(() => ({
  '--range-progress': (((Number(settings.readingInterval) - 5) / 55) * 100) + '%',
}));

const summaryRows = computed(() => [
  { label: 'Tema', value: isDark.value ? 'Escuro' : 'Claro' },
  { label: 'Modo simulação', value: settings.simulationMode ? 'Ativo' : 'Inativo' },
  { label: 'Apresentação', value: settings.presentationMode ? 'Ativa' : 'Inativa' },
  { label: 'Anomalia demo', value: settings.anomalyDemo ? 'Ativa' : 'Inativa' },
  { label: 'Intervalo', value: `${settings.readingInterval}s` },
  { label: 'Período padrão', value: settings.defaultPeriod },
  { label: 'Unidade', value: settings.measurementUnit },
]);

const pushStatus = computed(() => {
  if (pushPermission.value === 'unsupported') {
    return 'Seu navegador não tem suporte a notificações.';
  }

  if (pushPermission.value === 'granted') {
    return 'Permissao concedida para alertas locais do navegador.';
  }

  if (pushPermission.value === 'denied') {
    return 'Permissao bloqueada no navegador.';
  }

  return 'Pedir permissao para alertas locais do navegador.';
});

const showSaved = () => {
  saved.value = true;
  window.setTimeout(() => {
    saved.value = false;
  }, 1600);
};

const saveAppSettings = () => {
  saveSettings(settings);
  const account = updateAccount({
    emailAlerts: settings.emailAlerts,
    weeklyReport: settings.weeklySummary,
    reportFrequency: settings.defaultPeriod,
    theme: isDark.value ? 'dark' : 'light',
    themeConfigured: true,
    settings: { ...settings },
  });
  syncCurrentUserProfile(account).catch(() => {});
  showSaved();
};

const restoreDefaults = () => {
  Object.assign(settings, resetSettings());
  saveAppSettings();
  showSaved();
};

const changeTheme = async () => {
  isDark.value = toggleTheme() === 'dark';
  const account = updateAccount({
    theme: isDark.value ? 'dark' : 'light',
    themeConfigured: true,
  });
  await syncCurrentUserProfile(account).catch(() => {});
};

const togglePushAlerts = async (event) => {
  if (!event.target.checked) {
    settings.pushAlerts = false;
    return;
  }

  if (typeof Notification === 'undefined') {
    settings.pushAlerts = false;
    pushPermission.value = 'unsupported';
    return;
  }

  pushPermission.value = await Notification.requestPermission();
  settings.pushAlerts = pushPermission.value === 'granted';
};

const togglePresentationMode = () => {
  const nextSettings = settings.presentationMode ? disablePresentationMode(settings) : enablePresentationMode(settings);
  Object.assign(settings, nextSettings);
  saveAppSettings();
};

const syncSimulationMode = (event) => {
  Object.assign(settings, setSimulationMode(event.currentTarget.checked, settings));
  saveAppSettings();
};

const openDefaultPeriod = () => {
  saveAppSettings();
  router.push(getDefaultPeriodRoute(settings.defaultPeriod));
};

watch(
  settings,
  () => {
    saveSettings(settings);
    const account = updateAccount({
      emailAlerts: settings.emailAlerts,
      weeklyReport: settings.weeklySummary,
      reportFrequency: settings.defaultPeriod,
      theme: isDark.value ? 'dark' : 'light',
      themeConfigured: true,
      settings: { ...settings },
    });
    syncCurrentUserProfile(account).catch(() => {});
  },
  { deep: true },
);

</script>

<style scoped>
.settings-layout {
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 340px;
}

.settings-panel,
.summary-panel {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  box-shadow: var(--agua-shadow);
  padding: 20px;
}

.settings-layout > .settings-panel {
  grid-column: 1;
}

.summary-panel {
  grid-column: 2;
  grid-row: 1 / span 4;
}

.panel-title {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-title h2,
.summary-panel h2 {
  color: var(--agua-petroleo);
  font-size: 18px;
  margin: 0 0 5px;
}

.panel-title p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.saved-pill {
  align-items: center;
  background: #eaf9ef;
  border-radius: 999px;
  color: var(--agua-sucesso);
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 5px;
  padding: 7px 10px;
}

.theme-row,
.switch-row,
.range-row {
  align-items: center;
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  color: var(--agua-texto);
  display: grid;
  gap: 14px;
  grid-template-columns: auto 1fr;
  min-height: 62px;
  padding: 13px 14px;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.theme-row {
  cursor: pointer;
  margin-bottom: 10px;
  text-align: left;
  width: 100%;
}

.theme-row > span,
.summary-icon {
  background: rgba(28, 167, 160, 0.14);
  border-radius: 14px;
  color: var(--agua-petroleo);
  display: grid;
  font-size: 22px;
  height: 42px;
  place-items: center;
  width: 42px;
}

.theme-row strong,
.switch-row span,
.range-row span,
label {
  color: var(--agua-texto);
  font-size: 12px;
  font-weight: 700;
}

.theme-row small,
.switch-row small,
.range-row small {
  color: var(--agua-suave);
  display: block;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.45;
  margin-top: 4px;
}

.switch-row,
.range-row {
  grid-template-columns: 1fr auto;
}

.switch-row {
  cursor: pointer;
}

.switch-row:hover,
.range-row:hover {
  border-color: color-mix(in srgb, var(--agua-agua) 34%, var(--agua-borda));
}

.switch-row:has(input:checked) {
  background:
    linear-gradient(135deg, rgba(28, 167, 160, 0.1), transparent 54%),
    var(--agua-muted);
  border-color: color-mix(in srgb, var(--agua-agua) 52%, var(--agua-borda));
}

.switch-row:has(input:disabled) {
  cursor: not-allowed;
  opacity: 0.56;
}

.switch-row input[type='checkbox'] {
  appearance: none;
  background: color-mix(in srgb, var(--agua-suave) 28%, var(--agua-branco));
  border: 1px solid color-mix(in srgb, var(--agua-suave) 42%, var(--agua-borda));
  border-radius: 999px;
  box-shadow: inset 0 1px 3px rgba(13, 75, 94, 0.12);
  cursor: pointer;
  height: 30px;
  margin: 0;
  position: relative;
  transition: background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
  width: 52px;
}

.switch-row input[type='checkbox']::before {
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 3px 8px rgba(13, 75, 94, 0.24);
  content: '';
  height: 22px;
  left: 3px;
  position: absolute;
  top: 3px;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 22px;
}

.switch-row input[type='checkbox']:checked {
  background: linear-gradient(135deg, var(--agua-agua), #54d7cd);
  border-color: var(--agua-agua);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.1);
}

.switch-row input[type='checkbox']:checked::before {
  transform: translateX(22px);
}

.switch-row input[type='checkbox']:focus-visible {
  outline: 3px solid rgba(28, 167, 160, 0.24);
  outline-offset: 3px;
}

.switch-row input[type='checkbox']:disabled {
  cursor: not-allowed;
}

.range-row {
  grid-template-columns: minmax(0, 1fr) minmax(220px, 300px);
  padding-block: 16px;
}

.range-control {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.range-current {
  align-items: baseline;
  background: rgba(28, 167, 160, 0.12);
  border: 1px solid rgba(28, 167, 160, 0.2);
  border-radius: 11px;
  display: inline-flex;
  gap: 5px;
  justify-self: end;
  padding: 5px 9px;
}

.range-current strong {
  color: var(--agua-petroleo);
  font-size: 16px;
  line-height: 1;
}

.range-current small {
  color: var(--agua-suave);
  font-size: 9px;
  font-weight: 700;
  margin: 0;
}

.range-control input[type='range'] {
  appearance: none;
  background:
    linear-gradient(
      to right,
      var(--agua-agua) 0,
      var(--agua-agua) var(--range-progress),
      color-mix(in srgb, var(--agua-suave) 24%, var(--agua-branco)) var(--range-progress),
      color-mix(in srgb, var(--agua-suave) 24%, var(--agua-branco)) 100%
    );
  border-radius: 999px;
  cursor: pointer;
  height: 8px;
  margin: 0;
  outline: none;
  width: 100%;
}

.range-control input[type='range']::-webkit-slider-thumb {
  appearance: none;
  background: #ffffff;
  border: 4px solid var(--agua-agua);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(13, 75, 94, 0.28);
  height: 24px;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
  width: 24px;
}

.range-control input[type='range']::-moz-range-thumb {
  background: #ffffff;
  border: 4px solid var(--agua-agua);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(13, 75, 94, 0.28);
  height: 16px;
  width: 16px;
}

.range-control input[type='range']:hover::-webkit-slider-thumb,
.range-control input[type='range']:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 6px rgba(28, 167, 160, 0.16), 0 4px 12px rgba(13, 75, 94, 0.28);
  transform: scale(1.04);
}

.range-limits {
  display: flex;
  justify-content: space-between;
}

.range-limits small {
  color: var(--agua-suave);
  font-size: 9px;
  font-weight: 700;
  margin: 0;
}

.stack {
  display: grid;
  gap: 10px;
}

.presentation-box {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(31, 206, 195, 0.14), transparent 48%),
    var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr auto;
  min-height: 68px;
  padding: 13px 14px;
}

.presentation-box.active {
  background:
    linear-gradient(135deg, rgba(31, 206, 195, 0.2), transparent 58%),
    var(--agua-muted);
  border-color: rgba(28, 167, 160, 0.42);
  box-shadow: inset 4px 0 0 var(--agua-agua);
}

.presentation-box strong {
  color: var(--agua-texto);
  display: block;
  font-size: 12px;
}

.presentation-box small {
  color: var(--agua-suave);
  display: block;
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.presentation-box button {
  align-items: center;
  background: var(--agua-petroleo);
  border: 1px solid var(--agua-petroleo);
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font: 700 12px Poppins, sans-serif;
  gap: 7px;
  min-height: 42px;
  padding: 0 12px;
  transition: box-shadow 0.18s ease, filter 0.18s ease, transform 0.18s ease;
}

.presentation-box button:hover {
  box-shadow: 0 9px 20px rgba(13, 75, 94, 0.2);
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.presentation-box.active button {
  background: linear-gradient(135deg, var(--agua-agua), #54d7cd);
  border-color: transparent;
  color: #073039;
}

.field-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr 1fr;
}

label {
  display: grid;
  gap: 8px;
}

select {
  background: var(--agua-branco);
  border: 1px solid var(--agua-input-border);
  border-radius: 14px;
  color: var(--agua-texto);
  font: 400 14px Poppins, sans-serif;
  min-height: 52px;
  outline: none;
  padding: 0 14px;
  width: 100%;
}

select:focus {
  border-color: var(--agua-agua);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.14);
}

.summary-icon {
  margin-bottom: 14px;
}

.summary-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.summary-list div {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  display: grid;
  gap: 5px;
  padding: 12px 14px;
}

.summary-list span {
  color: var(--agua-suave);
  font-size: 11px;
  font-weight: 700;
}

.summary-list strong {
  color: var(--agua-petroleo);
  font-size: 13px;
}

.actions {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.save-action,
.reset-action {
  align-items: center;
  border-radius: 14px;
  cursor: pointer;
  display: inline-flex;
  font: 700 13px Poppins, sans-serif;
  gap: 8px;
  justify-content: center;
  min-height: 46px;
  padding: 0 14px;
}

.save-action {
  background: linear-gradient(135deg, var(--agua-petroleo), #0f6578);
  border: 0;
  color: var(--agua-branco);
}

.reset-action {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  color: var(--agua-petroleo);
}

@media (max-width: 980px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-layout > .settings-panel,
  .summary-panel {
    grid-column: auto;
  }

}

@media (max-width: 620px) {
  .field-grid {
    grid-template-columns: 1fr;
  }

  .range-row {
    grid-template-columns: 1fr;
  }

  .presentation-box {
    grid-template-columns: 1fr;
  }

  .range-row input {
    width: 100%;
  }

  .range-current {
    justify-self: start;
  }
}
</style>
