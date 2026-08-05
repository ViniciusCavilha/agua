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
                <p>Consumo por dia em litros</p>
              </div>
              <span><ion-icon :icon="calendarOutline" /> {{ chartBadge }}</span>
            </div>

            <div class="bar-chart" aria-label="Grafico do periodo selecionado">
              <div v-for="bar in bars" :key="bar.day" class="bar-item">
                <strong>{{ bar.liters }}</strong>
                <span class="empty" />
                <small>{{ bar.day }}</small>
              </div>
            </div>
          </article>

          <article class="alert-card">
            <span class="alert-icon"><ion-icon :icon="alertCircleOutline" /></span>
            <h2>Periodo sem leituras</h2>
            <p>Esta tela ja esta pronta para receber os dados historicos quando o hidrometro for conectado.</p>
            <div class="health-row">
              <span>Total registrado</span>
              <strong>0 L</strong>
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
import { computed } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { alertCircleOutline, calendarOutline } from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';

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

const stats = computed(() => [
  { label: props.periodLabel, value: '0 L', detail: 'Aguardando dados' },
  { label: 'Media diaria', value: '0 L', detail: 'Aguardando dados' },
  { label: 'Pico do periodo', value: '0 L', detail: 'Aguardando dados' },
  { label: 'Custo estimado', value: 'R$ 0,00', detail: 'Aguardando tarifa' },
]);

const bars = computed(() => props.days.map((day) => ({ day, liters: '0 L' })));
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
  background: rgba(31, 206, 195, 0.18);
  border: 1px solid rgba(31, 206, 195, 0.28);
  border-radius: 999px 999px 6px 6px;
  min-height: 8px;
  width: min(100%, 34px);
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
