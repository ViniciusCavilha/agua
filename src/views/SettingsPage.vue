<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Configuracoes" :show-period="false">
        <section class="settings-layout">
          <aside class="summary-panel">
            <div class="summary-icon"><ion-icon :icon="settingsOutline" /></div>
            <h2>Configuracao ativa</h2>
            <div class="summary-list">
              <div v-for="item in summaryRows" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <div class="actions">
              <button class="save-action" type="button" @click="saveAppSettings">
                <ion-icon :icon="saveOutline" />
                Salvar configuracoes
              </button>
              <button class="reset-action" type="button" @click="restoreDefaults">
                <ion-icon :icon="refreshOutline" />
                Restaurar padrao
              </button>
              <button class="reset-action" type="button" @click="openDefaultPeriod">
                <ion-icon :icon="openOutline" />
                Abrir periodo padrao
              </button>
            </div>
          </aside>

          <article class="settings-panel">
            <div class="panel-title">
              <div>
                <h2>Aparencia</h2>
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
                <small>Reduz espacos em listas e paineis para caber mais informacao.</small>
              </span>
              <input v-model="settings.compactMode" type="checkbox" />
            </label>
          </article>

          <article class="settings-panel">
            <div class="panel-title">
              <div>
                <h2>Notificacoes</h2>
                <p>Defina como alertas e resumos devem aparecer.</p>
              </div>
            </div>

            <div class="stack">
              <label class="switch-row">
                <span>
                  Alertas por e-mail
                  <small>Enviar avisos quando o consumo sair do padrao.</small>
                </span>
                <input v-model="settings.emailAlerts" type="checkbox" />
              </label>

              <label class="switch-row">
                <span>
                  Notificacoes push
                  <small>{{ pushStatus }}</small>
                </span>
                <input :checked="settings.pushAlerts" type="checkbox" @change="togglePushAlerts" />
              </label>

              <label class="switch-row">
                <span>
                  Resumo semanal
                  <small>Preparar uma visao consolidada toda semana.</small>
                </span>
                <input v-model="settings.weeklySummary" type="checkbox" />
              </label>
            </div>
          </article>

          <article class="settings-panel">
            <div class="panel-title">
              <div>
                <h2>Leituras e simulacao</h2>
                <p>Controles para usar dados simulados ate conectar o hidrometro.</p>
              </div>
            </div>

            <div class="stack">
              <label class="switch-row">
                <span>
                  Modo simulacao
                  <small>Usar leituras simuladas enquanto nao houver hardware conectado.</small>
                </span>
                <input v-model="settings.simulationMode" type="checkbox" />
              </label>

              <label class="switch-row">
                <span>
                  Cenario de anomalia
                  <small>Forcar vazamento/consumo fora do horario em demonstracoes.</small>
                </span>
                <input v-model="settings.anomalyDemo" type="checkbox" />
              </label>

              <label class="range-row">
                <span>
                  Intervalo de leitura
                  <small>{{ settings.readingInterval }} segundos</small>
                </span>
                <input v-model.number="settings.readingInterval" type="range" min="5" max="60" step="5" />
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
                Periodo padrao
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
  sunnyOutline,
} from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';
import { updateAccount } from '../data/account-store.js';
import { getDefaultPeriodRoute, getSettings, resetSettings, saveSettings } from '../data/settings-store.js';
import { getSavedTheme, toggleTheme } from '../data/theme-store.js';

const router = useRouter();
const settings = reactive(getSettings());
const saved = ref(false);
const isDark = ref(getSavedTheme() === 'dark');
const pushPermission = ref(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);

const summaryRows = computed(() => [
  { label: 'Tema', value: isDark.value ? 'Escuro' : 'Claro' },
  { label: 'Modo simulacao', value: settings.simulationMode ? 'Ativo' : 'Inativo' },
  { label: 'Anomalia demo', value: settings.anomalyDemo ? 'Ativa' : 'Inativa' },
  { label: 'Intervalo', value: `${settings.readingInterval}s` },
  { label: 'Periodo padrao', value: settings.defaultPeriod },
  { label: 'Unidade', value: settings.measurementUnit },
]);

const pushStatus = computed(() => {
  if (pushPermission.value === 'unsupported') {
    return 'Seu navegador nao tem suporte a notificacoes.';
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
  updateAccount({
    emailAlerts: settings.emailAlerts,
    weeklyReport: settings.weeklySummary,
    reportFrequency: settings.defaultPeriod,
  });
  showSaved();
};

const restoreDefaults = () => {
  Object.assign(settings, resetSettings());
  showSaved();
};

const changeTheme = () => {
  isDark.value = toggleTheme() === 'dark';
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

const openDefaultPeriod = () => {
  saveAppSettings();
  router.push(getDefaultPeriodRoute(settings.defaultPeriod));
};

watch(
  settings,
  () => {
    saveSettings(settings);
    updateAccount({
      emailAlerts: settings.emailAlerts,
      weeklyReport: settings.weeklySummary,
      reportFrequency: settings.defaultPeriod,
    });
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

.switch-row input {
  accent-color: var(--agua-agua);
  height: 20px;
  width: 20px;
}

.range-row input {
  accent-color: var(--agua-agua);
  width: 170px;
}

.stack {
  display: grid;
  gap: 10px;
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

  .range-row input {
    width: 100%;
  }
}
</style>
