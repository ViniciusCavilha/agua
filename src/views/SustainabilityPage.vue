<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Sustentabilidade" :show-period="false">
        <section class="sustainability-hero">
          <div class="hero-copy">
            <span class="eyebrow">Biologia e consumo consciente</span>
            <h2>Água e Sustentabilidade</h2>
            <p>A água é essencial para a vida. Entender seu consumo é o primeiro passo para preservá-la.</p>
          </div>
          <div class="hero-symbol" aria-hidden="true">
            <span><ion-icon :icon="waterOutline" /></span>
            <ion-icon :icon="leafOutline" />
          </div>
        </section>

        <section class="section-block importance-section" aria-labelledby="importance-title">
          <div class="section-heading">
            <span>Vida em equilíbrio</span>
            <h2 id="importance-title">Por que a água é importante?</h2>
            <p>A água participa de processos essenciais à vida e está presente no funcionamento dos organismos e dos ecossistemas.</p>
          </div>

          <div class="importance-grid">
            <article v-for="item in importanceItems" :key="item.title" class="compact-card">
              <span class="icon-bubble"><ion-icon :icon="item.icon" /></span>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </article>
          </div>
        </section>

        <section class="section-block" aria-labelledby="waste-title">
          <div class="section-heading inline-heading">
            <div>
              <span>Além da conta</span>
              <h2 id="waste-title">O impacto do desperdício</h2>
            </div>
            <p>Desperdiçar água também aumenta a pressão sobre os recursos naturais e os sistemas que tornam seu uso possível.</p>
          </div>

          <div class="impact-grid">
            <article v-for="impact in impactItems" :key="impact.title" class="impact-card">
              <span><ion-icon :icon="impact.icon" /></span>
              <h3>{{ impact.title }}</h3>
              <p>{{ impact.description }}</p>
            </article>
          </div>
        </section>

        <section class="monitoring-section" aria-labelledby="monitoring-title">
          <div class="monitoring-copy">
            <span>Como o Água+ ajuda?</span>
            <h2 id="monitoring-title">Monitorar é o primeiro passo para entender.</h2>
            <p>O Água+ transforma medições em informações visuais. Assim, o usuário pode acompanhar o consumo e perceber alterações no padrão para tomar decisões mais conscientes.</p>
          </div>

          <div class="monitoring-flow" aria-label="Sensor, medição, dados, conscientização e consumo mais consciente">
            <template v-for="(step, index) in monitoringSteps" :key="step.label">
              <div class="flow-step">
                <span><ion-icon :icon="step.icon" /></span>
                <strong>{{ step.label }}</strong>
              </div>
              <ion-icon v-if="index < monitoringSteps.length - 1" class="flow-arrow" :icon="chevronForwardOutline" />
            </template>
          </div>
        </section>

        <section class="goals-section" aria-labelledby="goals-title">
          <div class="section-heading">
            <span>Objetivos de Desenvolvimento Sustentável</span>
            <h2 id="goals-title">O monitoramento como parte da conversa</h2>
            <p>O aplicativo contribui para a conscientização e para o uso eficiente da água, sem substituir as ações amplas necessárias para alcançar esses objetivos.</p>
          </div>

          <div class="ods-grid">
            <article class="ods-card ods-six">
              <div class="ods-number">06</div>
              <div>
                <span>ODS 6</span>
                <h3>Água Potável e Saneamento</h3>
                <p>A ODS 6 busca garantir disponibilidade e gestão sustentável da água e do saneamento.</p>
                <small>O Água+ contribui para essa discussão ao incentivar o monitoramento e o uso mais eficiente da água.</small>
              </div>
            </article>

            <article class="ods-card ods-twelve">
              <div class="ods-number">12</div>
              <div>
                <span>ODS 12</span>
                <h3>Consumo e Produção Responsáveis</h3>
                <p>A ODS 12 incentiva padrões de consumo mais responsáveis.</p>
                <small>Ao tornar o consumo de água mais visível, o Água+ busca estimular a percepção do desperdício e o consumo consciente.</small>
              </div>
            </article>
          </div>
        </section>

        <section class="closing-grid">
          <article class="did-you-know">
            <span class="icon-bubble"><ion-icon :icon="bulbOutline" /></span>
            <div>
              <small>Você sabia?</small>
              <h2>A água conecta a vida.</h2>
              <p>A água está presente em todos os ecossistemas e é fundamental para a manutenção da vida.</p>
              <em>Espaço preparado para futuras informações científicas acompanhadas de suas fontes.</em>
            </div>
          </article>

          <article class="consumption-cta">
            <span>Da conscientização à ação</span>
            <h2>Agora, acompanhe seu consumo.</h2>
            <p>Use os dados do Água+ para observar seus padrões e identificar oportunidades de economia.</p>
            <router-link to="/consumo">
              Ver meu consumo
              <ion-icon :icon="arrowForwardOutline" />
            </router-link>
          </article>
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
  barChartOutline,
  bulbOutline,
  businessOutline,
  chevronForwardOutline,
  earthOutline,
  hardwareChipOutline,
  heartOutline,
  leafOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  waterOutline,
} from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';

const importanceItems = [
  { title: 'Seres humanos', description: 'Faz parte do funcionamento e do equilíbrio dos organismos.', icon: peopleOutline },
  { title: 'Animais e plantas', description: 'Sustenta ciclos de vida e processos biológicos essenciais.', icon: leafOutline },
  { title: 'Ecossistemas', description: 'Conecta ambientes, organismos e recursos naturais.', icon: earthOutline },
  { title: 'Saúde e bem-estar', description: 'O acesso à água adequada é parte das condições necessárias à vida.', icon: heartOutline },
];

const impactItems = [
  { title: 'Recursos hídricos', description: 'O uso excessivo amplia a demanda sobre as fontes de água.', icon: waterOutline },
  { title: 'Ecossistemas', description: 'Preservar a água também ajuda a proteger os ambientes naturais.', icon: leafOutline },
  { title: 'Abastecimento', description: 'O desperdício pressiona os sistemas de captação, tratamento e distribuição.', icon: businessOutline },
  { title: 'Consumo consciente', description: 'Perceber hábitos é um passo importante para reduzir desperdícios.', icon: shieldCheckmarkOutline },
];

const monitoringSteps = [
  { label: 'Sensor', icon: hardwareChipOutline },
  { label: 'Medição', icon: waterOutline },
  { label: 'Dados', icon: analyticsOutline },
  { label: 'Conscientização', icon: bulbOutline },
  { label: 'Consumo consciente', icon: barChartOutline },
];
</script>

<style scoped>
.sustainability-hero {
  align-items: center;
  background:
    radial-gradient(circle at 82% 18%, rgba(125, 226, 217, 0.28), transparent 26%),
    linear-gradient(135deg, var(--agua-feature-bg), #126b72);
  border-radius: 24px;
  color: var(--agua-feature-text);
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-bottom: 20px;
  min-height: 250px;
  overflow: hidden;
  padding: clamp(24px, 5vw, 42px);
  position: relative;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.eyebrow,
.monitoring-copy > span,
.consumption-cta > span {
  color: #a9eee8;
  display: block;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.sustainability-hero h2 {
  color: #ffffff;
  font-size: clamp(28px, 5vw, 46px);
  line-height: 1.08;
  margin: 0;
  max-width: 650px;
}

.sustainability-hero p {
  color: #d9f4f4;
  font-size: 14px;
  line-height: 1.7;
  margin: 16px 0 0;
  max-width: 610px;
}

.hero-symbol {
  align-items: end;
  display: flex;
  font-size: 38px;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.hero-symbol span {
  align-items: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 34px;
  display: flex;
  font-size: 72px;
  height: 150px;
  justify-content: center;
  width: 150px;
}

.hero-symbol > ion-icon {
  color: #8be1a8;
  margin-left: -34px;
}

.section-block,
.goals-section {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 20px;
  box-shadow: var(--agua-shadow);
  margin-bottom: 20px;
  padding: clamp(20px, 4vw, 30px);
}

.section-heading {
  max-width: 760px;
}

.section-heading > span,
.did-you-know small,
.ods-card > div > span {
  color: var(--agua-agua);
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.07em;
  margin-bottom: 7px;
  text-transform: uppercase;
}

.section-heading h2,
.monitoring-copy h2,
.did-you-know h2,
.consumption-cta h2 {
  color: var(--agua-petroleo);
  font-size: clamp(20px, 3vw, 27px);
  line-height: 1.25;
  margin: 0;
}

.section-heading p,
.monitoring-copy p,
.did-you-know p,
.consumption-cta p {
  color: var(--agua-suave);
  font-size: 13px;
  line-height: 1.7;
  margin: 10px 0 0;
}

.inline-heading {
  align-items: end;
  display: grid;
  gap: 24px;
  grid-template-columns: 0.8fr 1.2fr;
  max-width: none;
}

.importance-grid,
.impact-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 24px;
}

.compact-card {
  align-items: start;
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 16px;
  display: grid;
  gap: 12px;
  padding: 18px;
}

.icon-bubble,
.impact-card > span,
.flow-step > span {
  align-items: center;
  background: color-mix(in srgb, var(--agua-agua) 13%, var(--agua-branco));
  border-radius: 13px;
  color: var(--agua-agua);
  display: flex;
  font-size: 22px;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.compact-card h3,
.impact-card h3,
.ods-card h3 {
  color: var(--agua-petroleo);
  font-size: 14px;
  margin: 0 0 6px;
}

.compact-card p,
.impact-card p,
.ods-card p,
.ods-card small {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.impact-card {
  border-left: 3px solid var(--agua-agua);
  padding: 4px 16px 4px 14px;
}

.impact-card > span {
  margin-bottom: 14px;
}

.monitoring-section {
  background:
    linear-gradient(135deg, rgba(28, 167, 160, 0.08), transparent 42%),
    var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 20px;
  box-shadow: var(--agua-shadow);
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(260px, 0.7fr) minmax(0, 1.3fr);
  margin-bottom: 20px;
  padding: clamp(22px, 4vw, 32px);
}

.monitoring-copy > span {
  color: var(--agua-agua);
}

.monitoring-flow {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-width: 0;
}

.flow-step {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 9px;
  min-width: 80px;
  text-align: center;
}

.flow-step strong {
  color: var(--agua-petroleo);
  font-size: 10px;
  line-height: 1.35;
}

.flow-arrow {
  color: var(--agua-input-border);
  flex: 0 0 auto;
  font-size: 20px;
}

.ods-grid,
.closing-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 24px;
}

.ods-card {
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  display: grid;
  gap: 18px;
  grid-template-columns: auto 1fr;
  overflow: hidden;
  padding: 20px;
  position: relative;
}

.ods-card::after {
  background: var(--ods-color);
  bottom: 0;
  content: '';
  left: 0;
  position: absolute;
  top: 0;
  width: 5px;
}

.ods-six {
  --ods-color: #24a6a0;
}

.ods-twelve {
  --ods-color: #b78b2f;
}

.ods-number {
  align-items: center;
  background: color-mix(in srgb, var(--ods-color) 14%, var(--agua-branco));
  border-radius: 15px;
  color: var(--ods-color);
  display: flex;
  font-size: 24px;
  font-weight: 800;
  height: 58px;
  justify-content: center;
  width: 58px;
}

.ods-card small {
  border-top: 1px solid var(--agua-borda);
  display: block;
  margin-top: 12px;
  padding-top: 12px;
}

.closing-grid {
  margin-top: 0;
}

.did-you-know,
.consumption-cta {
  border-radius: 20px;
  display: grid;
  gap: 16px;
  padding: clamp(22px, 4vw, 30px);
}

.did-you-know {
  align-items: start;
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  grid-template-columns: auto 1fr;
}

.did-you-know em {
  color: var(--agua-suave);
  display: block;
  font-size: 10px;
  font-style: normal;
  line-height: 1.5;
  margin-top: 12px;
}

.consumption-cta {
  align-content: center;
  background: var(--agua-feature-bg);
  color: var(--agua-feature-text);
}

.consumption-cta h2 {
  color: var(--agua-feature-text);
}

.consumption-cta p {
  color: var(--agua-feature-muted);
}

.consumption-cta a {
  align-items: center;
  align-self: start;
  background: #ffffff;
  border-radius: 13px;
  color: #0d4b5e;
  display: inline-flex;
  font-size: 13px;
  font-weight: 800;
  gap: 8px;
  justify-self: start;
  margin-top: 4px;
  min-height: 44px;
  padding: 0 16px;
  text-decoration: none;
}

@media (max-width: 1080px) {
  .importance-grid,
  .impact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .monitoring-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .sustainability-hero {
    grid-template-columns: 1fr;
  }

  .hero-symbol {
    display: none;
  }

  .inline-heading,
  .ods-grid,
  .closing-grid {
    grid-template-columns: 1fr;
  }

  .monitoring-flow {
    align-items: stretch;
    display: grid;
    gap: 9px;
    grid-template-columns: 1fr;
  }

  .flow-step {
    align-items: center;
    background: var(--agua-muted);
    border: 1px solid var(--agua-borda);
    border-radius: 13px;
    flex-direction: row;
    padding: 10px 12px;
    text-align: left;
  }

  .flow-step > span {
    flex: 0 0 38px;
    height: 38px;
  }

  .flow-arrow {
    justify-self: center;
    transform: rotate(90deg);
  }
}

@media (max-width: 520px) {
  .importance-grid,
  .impact-grid {
    grid-template-columns: 1fr;
  }

  .impact-card {
    padding-bottom: 12px;
    padding-top: 12px;
  }

  .ods-card,
  .did-you-know {
    grid-template-columns: 1fr;
  }
}
</style>
