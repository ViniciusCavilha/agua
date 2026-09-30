<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="História da Água" mobile-title="História" :show-period="false">
        <section class="history-hero">
          <div class="hero-copy">
            <span>Sociedade, tecnologia e transformação</span>
            <h2>A história da humanidade também passa pela água.</h2>
            <p>A água sempre esteve ligada ao desenvolvimento das sociedades. Ao longo da história, diferentes povos criaram maneiras de captar, armazenar, transportar e distribuir esse recurso.</p>
          </div>

          <div class="hero-visual" aria-hidden="true">
            <div class="history-ring ring-large">
              <ion-icon :icon="waterOutline" />
            </div>
            <div class="history-ring ring-small">
              <ion-icon :icon="hourglassOutline" />
            </div>
            <span class="history-line" />
          </div>
        </section>

        <section class="timeline-section" aria-labelledby="timeline-title">
          <header class="section-heading">
            <span>Linha do tempo</span>
            <h2 id="timeline-title">Da captação ao monitoramento</h2>
            <p>Cada período desenvolveu novas formas de conviver com a água e responder às necessidades de sua sociedade.</p>
          </header>

          <div class="timeline">
            <article
              v-for="(period, index) in historyPeriods"
              :key="period.title"
              class="timeline-item"
              :class="{ reverse: index % 2 !== 0 }"
            >
              <div class="timeline-card">
                <div class="card-topline">
                  <span class="period-icon"><ion-icon :icon="period.icon" /></span>
                  <small>{{ period.eyebrow }}</small>
                </div>
                <h3>{{ period.title }}</h3>
                <p>{{ period.description }}</p>
              </div>

              <div class="timeline-marker" aria-hidden="true">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
              </div>

              <div class="timeline-note" aria-hidden="true">
                <ion-icon :icon="period.icon" />
                <span>{{ period.keyword }}</span>
              </div>
            </article>
          </div>
        </section>

        <section class="evolution-strip" aria-label="Evolução da relação com a água">
          <template v-for="(step, index) in evolutionSteps" :key="step.label">
            <div class="evolution-step">
              <ion-icon :icon="step.icon" />
              <span>{{ step.label }}</span>
            </div>
            <ion-icon v-if="index < evolutionSteps.length - 1" class="step-arrow" :icon="chevronForwardOutline" />
          </template>
        </section>

        <section class="agua-connection">
          <div class="connection-icon" aria-hidden="true">
            <ion-icon :icon="hardwareChipOutline" />
            <span><ion-icon :icon="analyticsOutline" /></span>
          </div>

          <div class="connection-copy">
            <span>O próximo passo dessa história</span>
            <h2>Do controle da água ao monitoramento inteligente.</h2>
            <p>A relação da humanidade com a água continua evoluindo. O Água+ faz parte desse processo ao utilizar sensores, conectividade e dados para acompanhar o consumo e incentivar uma utilização mais consciente.</p>
          </div>

          <router-link to="/consumo">
            Acompanhar consumo
            <ion-icon :icon="arrowForwardOutline" />
          </router-link>
        </section>
      </AppShell>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  analyticsOutline,
  arrowForwardOutline,
  businessOutline,
  chevronForwardOutline,
  earthOutline,
  hardwareChipOutline,
  hourglassOutline,
  leafOutline,
  libraryOutline,
  settingsOutline,
  waterOutline,
} from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';

const historyPeriods = [
  {
    eyebrow: 'Antiguidade',
    title: 'Antiguidade',
    description: 'Rios como o Nilo, Tigre e Eufrates foram fundamentais para o desenvolvimento de sociedades antigas, fornecendo água para agricultura, consumo e outras atividades.',
    keyword: 'Rios e sociedades',
    icon: libraryOutline,
  },
  {
    eyebrow: 'Agricultura',
    title: 'Irrigação e agricultura',
    description: 'Com o desenvolvimento da agricultura, surgiram técnicas e sistemas para controlar e distribuir a água, permitindo o cultivo em diferentes regiões.',
    keyword: 'Cultivo e irrigação',
    icon: leafOutline,
  },
  {
    eyebrow: 'Urbanização',
    title: 'Desenvolvimento das cidades',
    description: 'O crescimento das populações aumentou a necessidade de sistemas de abastecimento, armazenamento e distribuição de água.',
    keyword: 'Abastecimento',
    icon: businessOutline,
  },
  {
    eyebrow: 'Transformações modernas',
    title: 'Industrialização',
    description: 'A expansão das cidades e das atividades industriais aumentou significativamente a demanda por água e impulsionou o desenvolvimento das infraestruturas de abastecimento e saneamento.',
    keyword: 'Infraestrutura',
    icon: settingsOutline,
  },
  {
    eyebrow: 'Atualidade',
    title: 'Água no mundo atual',
    description: 'Hoje, além de captar e distribuir água, temos tecnologias capazes de acompanhar seu consumo e identificar padrões de utilização.',
    keyword: 'Dados e tecnologia',
    icon: earthOutline,
  },
];

const evolutionSteps = [
  { label: 'Captação', icon: waterOutline },
  { label: 'Armazenamento', icon: businessOutline },
  { label: 'Distribuição', icon: settingsOutline },
  { label: 'Monitoramento', icon: analyticsOutline },
];
</script>

<style scoped>
.history-hero {
  align-items: center;
  background:
    radial-gradient(circle at 85% 16%, rgba(125, 226, 217, 0.2), transparent 27%),
    linear-gradient(135deg, #0d4b5e, #123944 62%, #145f66);
  border-radius: 24px;
  color: #ffffff;
  display: grid;
  gap: 30px;
  grid-template-columns: minmax(0, 1fr) 230px;
  margin-bottom: 20px;
  min-height: 290px;
  overflow: hidden;
  padding: clamp(26px, 5vw, 44px);
  position: relative;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.hero-copy > span,
.connection-copy > span {
  color: #9de8e2;
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.09em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.hero-copy h2 {
  color: #ffffff;
  font-size: clamp(27px, 4.5vw, 43px);
  line-height: 1.12;
  margin: 0;
  max-width: 720px;
}

.hero-copy p {
  color: #d3eff1;
  font-size: 13px;
  line-height: 1.75;
  margin: 17px 0 0;
  max-width: 730px;
}

.hero-visual {
  height: 190px;
  position: relative;
}

.history-ring {
  align-items: center;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #8de1db;
  display: flex;
  justify-content: center;
  position: absolute;
  z-index: 1;
}

.ring-large {
  font-size: 64px;
  height: 150px;
  right: 0;
  top: 0;
  width: 150px;
}

.ring-small {
  bottom: 0;
  font-size: 30px;
  height: 82px;
  left: 0;
  width: 82px;
}

.history-line {
  background: linear-gradient(90deg, #8de1db, rgba(141, 225, 219, 0.08));
  height: 2px;
  left: 62px;
  position: absolute;
  right: 78px;
  top: 112px;
  transform: rotate(-24deg);
}

.timeline-section {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 22px;
  box-shadow: var(--agua-shadow);
  margin-bottom: 20px;
  padding: clamp(22px, 4vw, 34px);
}

.section-heading {
  margin: 0 auto 30px;
  max-width: 700px;
  text-align: center;
}

.section-heading > span {
  color: var(--agua-agua);
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin-bottom: 7px;
  text-transform: uppercase;
}

.section-heading h2 {
  color: var(--agua-petroleo);
  font-size: clamp(22px, 3vw, 29px);
  margin: 0;
}

.section-heading p {
  color: var(--agua-suave);
  font-size: 13px;
  line-height: 1.7;
  margin: 11px 0 0;
}

.timeline {
  position: relative;
}

.timeline::before {
  background: linear-gradient(180deg, transparent, var(--agua-agua) 8%, var(--agua-agua) 92%, transparent);
  bottom: 0;
  content: '';
  left: 50%;
  opacity: 0.35;
  position: absolute;
  top: 0;
  transform: translateX(-1px);
  width: 2px;
}

.timeline-item {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) 58px minmax(0, 1fr);
  margin-bottom: 22px;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-card {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--agua-agua) 7%, transparent), transparent 45%),
    var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  padding: 20px;
}

.timeline-item.reverse .timeline-card {
  grid-column: 3;
}

.timeline-item.reverse .timeline-marker {
  grid-column: 2;
  grid-row: 1;
}

.timeline-item.reverse .timeline-note {
  grid-column: 1;
  grid-row: 1;
  justify-self: end;
  text-align: right;
}

.card-topline {
  align-items: center;
  display: flex;
  gap: 10px;
  margin-bottom: 13px;
}

.period-icon {
  align-items: center;
  background: color-mix(in srgb, var(--agua-agua) 14%, var(--agua-branco));
  border-radius: 11px;
  color: var(--agua-agua);
  display: flex;
  font-size: 20px;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.card-topline small {
  color: var(--agua-agua);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.timeline-card h3 {
  color: var(--agua-petroleo);
  font-size: 17px;
  margin: 0 0 8px;
}

.timeline-card p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
}

.timeline-marker {
  align-items: center;
  background: var(--agua-branco);
  border: 2px solid var(--agua-agua);
  border-radius: 50%;
  box-shadow: 0 0 0 7px color-mix(in srgb, var(--agua-agua) 10%, var(--agua-branco));
  color: var(--agua-agua);
  display: flex;
  font-size: 11px;
  font-weight: 800;
  height: 42px;
  justify-content: center;
  justify-self: center;
  position: relative;
  width: 42px;
  z-index: 1;
}

.timeline-note {
  align-items: center;
  color: var(--agua-suave);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 8px;
}

.timeline-note ion-icon {
  color: var(--agua-agua);
  font-size: 21px;
}

.evolution-strip {
  align-items: center;
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 18px clamp(18px, 4vw, 30px);
}

.evolution-step {
  align-items: center;
  color: var(--agua-petroleo);
  display: flex;
  font-size: 12px;
  font-weight: 700;
  gap: 9px;
}

.evolution-step ion-icon {
  color: var(--agua-agua);
  font-size: 21px;
}

.step-arrow {
  color: var(--agua-input-border);
  font-size: 20px;
}

.agua-connection {
  align-items: center;
  background:
    radial-gradient(circle at 9% 10%, rgba(125, 226, 217, 0.18), transparent 22%),
    var(--agua-feature-bg);
  border-radius: 22px;
  color: var(--agua-feature-text);
  display: grid;
  gap: 24px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: clamp(24px, 4vw, 34px);
}

.connection-icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  display: flex;
  font-size: 35px;
  height: 82px;
  justify-content: center;
  position: relative;
  width: 82px;
}

.connection-icon span {
  align-items: center;
  background: #7de2d9;
  border-radius: 9px;
  bottom: -7px;
  color: #0d4b5e;
  display: flex;
  font-size: 17px;
  height: 30px;
  justify-content: center;
  position: absolute;
  right: -7px;
  width: 30px;
}

.connection-copy > span {
  margin-bottom: 7px;
}

.connection-copy h2 {
  color: var(--agua-feature-text);
  font-size: clamp(20px, 3vw, 27px);
  line-height: 1.3;
  margin: 0;
}

.connection-copy p {
  color: var(--agua-feature-muted);
  font-size: 12px;
  line-height: 1.7;
  margin: 10px 0 0;
  max-width: 710px;
}

.agua-connection > a {
  align-items: center;
  background: #ffffff;
  border-radius: 13px;
  color: #0d4b5e;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  gap: 8px;
  min-height: 46px;
  padding: 0 16px;
  text-decoration: none;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .history-hero {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    display: none;
  }

  .agua-connection {
    grid-template-columns: auto 1fr;
  }

  .agua-connection > a {
    grid-column: 2;
    justify-self: start;
  }
}

@media (max-width: 700px) {
  .section-heading {
    margin-left: 48px;
    text-align: left;
  }

  .timeline::before {
    left: 21px;
  }

  .timeline-item,
  .timeline-item.reverse {
    align-items: start;
    gap: 14px;
    grid-template-columns: 43px minmax(0, 1fr);
    margin-bottom: 18px;
  }

  .timeline-item .timeline-card,
  .timeline-item.reverse .timeline-card {
    grid-column: 2;
    grid-row: 1;
  }

  .timeline-item .timeline-marker,
  .timeline-item.reverse .timeline-marker {
    grid-column: 1;
    grid-row: 1;
    height: 38px;
    width: 38px;
  }

  .timeline-note,
  .timeline-item.reverse .timeline-note {
    display: none;
  }

  .evolution-strip {
    align-items: stretch;
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr;
  }

  .evolution-step {
    background: var(--agua-muted);
    border-radius: 11px;
    padding: 10px 12px;
  }

  .step-arrow {
    justify-self: center;
    transform: rotate(90deg);
  }
}

@media (max-width: 520px) {
  .history-hero {
    min-height: 0;
  }

  .timeline-section {
    padding: 20px 14px;
  }

  .section-heading {
    margin-left: 47px;
  }

  .timeline-card {
    padding: 16px;
  }

  .agua-connection {
    align-items: start;
    grid-template-columns: 1fr;
  }

  .agua-connection > a {
    grid-column: 1;
  }
}
</style>
