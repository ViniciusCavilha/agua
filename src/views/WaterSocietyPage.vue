<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Água, História e Sustentabilidade" mobile-title="Água e sociedade" :show-period="false">
        <section class="story-hero">
          <div>
            <span class="eyebrow">História, Biologia e tecnologia</span>
            <h2>Da agricultura antiga ao uso inteligente da água.</h2>
            <p>
              A necessidade de produzir alimentos transformou a relação humana com a água. Canais,
              reservatórios e sistemas de irrigação ajudaram a formar sociedades e hoje evoluem para
              soluções de economia, reutilização e monitoramento.
            </p>
          </div>

          <div class="hero-path" aria-label="Agricultura, sociedade, sustentabilidade e tecnologia">
            <template v-for="(step, index) in heroSteps" :key="step.label">
              <div class="hero-step">
                <ion-icon :icon="step.icon" />
                <strong>{{ step.label }}</strong>
              </div>
              <ion-icon v-if="index < heroSteps.length - 1" class="hero-arrow" :icon="arrowForwardOutline" />
            </template>
          </div>
        </section>

        <section class="content-section" aria-labelledby="timeline-title">
          <header class="section-heading">
            <span>Uma história movida pela água</span>
            <h2 id="timeline-title">Agricultura, cidades e transformação</h2>
            <p>O desenvolvimento das técnicas de uso da água acompanha as mudanças da própria sociedade.</p>
          </header>

          <div class="timeline">
            <article v-for="(period, index) in historyPeriods" :key="period.title" class="timeline-card">
              <div class="timeline-index">{{ String(index + 1).padStart(2, '0') }}</div>
              <span class="card-icon"><ion-icon :icon="period.icon" /></span>
              <small>{{ period.period }}</small>
              <h3>{{ period.title }}</h3>
              <p>{{ period.description }}</p>
            </article>
          </div>
        </section>

        <section class="agriculture-section" aria-labelledby="biology-title">
          <div class="agriculture-copy">
            <span class="eyebrow dark">A ponte com a Biologia</span>
            <h2 id="biology-title">Por que a agricultura depende tanto da água?</h2>
            <p>
              As raízes absorvem água e sais minerais do solo. Essa água participa da fotossíntese,
              mantém a estrutura das células e circula pela planta até ser liberada parcialmente pela
              transpiração. Sem disponibilidade adequada, o crescimento e a produção de alimentos diminuem.
            </p>
            <div class="biology-flow" aria-label="Caminho da água na planta">
              <template v-for="(step, index) in biologySteps" :key="step">
                <strong>{{ step }}</strong>
                <ion-icon v-if="index < biologySteps.length - 1" :icon="chevronForwardOutline" />
              </template>
            </div>
          </div>

          <div class="fact-panel">
            <span><ion-icon :icon="nutritionOutline" /></span>
            <h3>Produzir mais com menos</h3>
            <p>
              Sustentabilidade não significa retirar a água da agricultura, mas aplicá-la na quantidade,
              no local e no momento necessários, reduzindo perdas e preservando as fontes.
            </p>
          </div>
        </section>

        <section class="content-section" aria-labelledby="irrigation-title">
          <header class="section-heading split-heading">
            <div>
              <span>Evolução da irrigação</span>
              <h2 id="irrigation-title">Da experiência ao controle por dados</h2>
            </div>
            <p>Cada técnica responde ao seu período histórico e apresenta diferentes níveis de eficiência.</p>
          </header>

          <div class="method-grid">
            <article v-for="method in irrigationMethods" :key="method.title" class="method-card">
              <span class="card-icon"><ion-icon :icon="method.icon" /></span>
              <div>
                <small>{{ method.period }}</small>
                <h3>{{ method.title }}</h3>
                <p>{{ method.description }}</p>
              </div>
            </article>
          </div>
        </section>

        <section class="reuse-section" aria-labelledby="reuse-title">
          <div class="reuse-heading">
            <span class="reuse-symbol"><ion-icon :icon="refreshOutline" /></span>
            <div>
              <span class="eyebrow dark">Reaproveitamento e reutilização</span>
              <h2 id="reuse-title">A mesma água pode cumprir mais de uma função.</h2>
              <p>
                Quando há captação, tratamento e destino corretos, parte da água pode retornar ao ciclo de
                uso. Isso diminui a demanda por água potável em atividades que não exigem esse padrão.
              </p>
            </div>
          </div>

          <div class="reuse-grid">
            <article v-for="item in reuseOptions" :key="item.title">
              <span class="card-icon"><ion-icon :icon="item.icon" /></span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <small>{{ item.application }}</small>
            </article>
          </div>

          <div class="reuse-cycle" aria-label="Ciclo seguro de reutilização da água">
            <template v-for="(step, index) in reuseCycle" :key="step">
              <strong>{{ step }}</strong>
              <ion-icon v-if="index < reuseCycle.length - 1" :icon="chevronForwardOutline" />
            </template>
          </div>

          <p class="safety-note">
            <ion-icon :icon="shieldCheckmarkOutline" />
            Água reutilizada não é potável sem tratamento adequado. O uso deve respeitar controle sanitário e a finalidade prevista.
          </p>
        </section>

        <section class="technology-section" aria-labelledby="technology-title">
          <div>
            <span class="eyebrow">O Água+ nessa evolução</span>
            <h2 id="technology-title">Do fluxo no encanamento à decisão consciente.</h2>
            <p>
              O sensor mede a passagem de água, o ESP32 envia as leituras e o Água+ transforma esses dados
              em histórico, alertas e metas. A mesma estrutura pode apoiar casas, instituições e futuros
              protótipos de irrigação monitorada.
            </p>
            <router-link to="/consumo">
              Acompanhar consumo
              <ion-icon :icon="arrowForwardOutline" />
            </router-link>
          </div>

          <div class="technology-flow">
            <template v-for="(step, index) in technologySteps" :key="step.label">
              <div><ion-icon :icon="step.icon" /><strong>{{ step.label }}</strong></div>
              <ion-icon v-if="index < technologySteps.length - 1" :icon="chevronForwardOutline" />
            </template>
          </div>
        </section>

        <section class="ods-section" aria-labelledby="ods-title">
          <header class="section-heading">
            <span>Desenvolvimento sustentável</span>
            <h2 id="ods-title">Uma solução conectada a diferentes desafios</h2>
          </header>
          <div class="ods-grid">
            <article v-for="goal in goals" :key="goal.number" :style="{ '--goal-color': goal.color }">
              <strong>{{ goal.number }}</strong>
              <div><small>{{ goal.label }}</small><h3>{{ goal.title }}</h3><p>{{ goal.description }}</p></div>
            </article>
          </div>
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
  hardwareChipOutline,
  leafOutline,
  libraryOutline,
  nutritionOutline,
  rainyOutline,
  refreshOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  waterOutline,
} from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';

const heroSteps = [
  { label: 'Agricultura', icon: nutritionOutline },
  { label: 'Sociedade', icon: businessOutline },
  { label: 'Sustentabilidade', icon: leafOutline },
  { label: 'Tecnologia', icon: hardwareChipOutline },
];

const historyPeriods = [
  { period: 'Há cerca de 12 mil anos', title: 'Revolução Agrícola', description: 'O cultivo e a domesticação de plantas favoreceram comunidades fixas e aumentaram a necessidade de administrar água.', icon: nutritionOutline },
  { period: 'Antiguidade', title: 'Primeiras civilizações', description: 'Povos próximos a grandes rios desenvolveram canais, diques e reservatórios para irrigar plantações e abastecer cidades.', icon: libraryOutline },
  { period: 'Períodos medieval e moderno', title: 'Expansão agrícola', description: 'Poços, rodas-d’água e técnicas regionais ampliaram o transporte e o aproveitamento da água.', icon: settingsOutline },
  { period: 'Revolução Industrial', title: 'Crescimento urbano', description: 'Bombas, tubulações e redes de abastecimento acompanharam a industrialização e o aumento das cidades.', icon: businessOutline },
  { period: 'Séculos XX e XXI', title: 'Agricultura contemporânea', description: 'Aspersão e gotejamento tornaram a irrigação mais controlável, mas a demanda crescente trouxe novos desafios ambientais.', icon: rainyOutline },
  { period: 'Presente e futuro', title: 'Gestão inteligente', description: 'Sensores e dados permitem identificar consumo, desperdício e oportunidades de reutilização com mais precisão.', icon: analyticsOutline },
];

const biologySteps = ['Solo', 'Raízes', 'Caule', 'Folhas', 'Atmosfera'];

const irrigationMethods = [
  { period: 'Técnica tradicional', title: 'Canais e sulcos', description: 'A gravidade distribui a água pelo terreno, com baixo custo e maior possibilidade de perdas.', icon: waterOutline },
  { period: 'Mecanização', title: 'Aspersão', description: 'A água é lançada sobre a plantação, simulando chuva e cobrindo áreas maiores.', icon: rainyOutline },
  { period: 'Eficiência', title: 'Gotejamento', description: 'Pequenas quantidades chegam próximas às raízes, reduzindo evaporação e desperdício.', icon: leafOutline },
  { period: 'Agricultura de precisão', title: 'Irrigação monitorada', description: 'Sensores orientam quando e quanto irrigar de acordo com dados do ambiente e do consumo.', icon: hardwareChipOutline },
];

const reuseOptions = [
  { title: 'Água da chuva', description: 'Pode ser captada em telhados e armazenada de forma protegida.', application: 'Uso possível: limpeza e irrigação, conforme o sistema instalado.', icon: rainyOutline },
  { title: 'Águas cinzas tratadas', description: 'Água de lavatórios e chuveiros pode ser reaproveitada após tratamento específico.', application: 'Uso possível: descargas e irrigação compatível com normas sanitárias.', icon: refreshOutline },
  { title: 'Retorno planejado', description: 'Na agricultura, sistemas adequados podem recuperar parte da água e controlar uma nova aplicação.', application: 'Benefício: menor retirada das fontes e melhor aproveitamento do recurso.', icon: leafOutline },
];

const reuseCycle = ['Captação', 'Armazenamento', 'Tratamento', 'Uso adequado', 'Monitoramento'];

const technologySteps = [
  { label: 'Sensor de vazão', icon: waterOutline },
  { label: 'ESP32', icon: hardwareChipOutline },
  { label: 'Dados', icon: analyticsOutline },
  { label: 'Ação', icon: leafOutline },
];

const goals = [
  { number: '02', label: 'ODS 2', title: 'Fome Zero e Agricultura Sustentável', description: 'Produção de alimentos com práticas agrícolas mais eficientes e resilientes.', color: '#d49f28' },
  { number: '06', label: 'ODS 6', title: 'Água Potável e Saneamento', description: 'Gestão sustentável, disponibilidade e uso eficiente da água.', color: '#178fa6' },
  { number: '12', label: 'ODS 12', title: 'Consumo e Produção Responsáveis', description: 'Redução de desperdícios e melhor aproveitamento dos recursos naturais.', color: '#b17c2e' },
];
</script>

<style scoped>
.story-hero,
.technology-section {
  background: linear-gradient(135deg, var(--agua-feature-bg), #126b72);
  border-radius: 20px;
  color: var(--agua-feature-text);
  display: grid;
  gap: 32px;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  margin-bottom: 20px;
  overflow: hidden;
  padding: clamp(26px, 5vw, 46px);
  position: relative;
}

.eyebrow,
.section-heading > span,
.reuse-heading .eyebrow {
  color: #9de9e2;
  display: block;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 9px;
  text-transform: uppercase;
}

.eyebrow.dark,
.section-heading > span {
  color: var(--agua-agua);
}

.story-hero h2,
.technology-section h2 {
  color: #fff;
  font-size: clamp(29px, 5vw, 45px);
  line-height: 1.08;
  margin: 0;
}

.story-hero p,
.technology-section p {
  color: #d9f4f4;
  font-size: 13px;
  line-height: 1.75;
  margin: 16px 0 0;
}

.hero-path,
.technology-flow,
.biology-flow,
.reuse-cycle {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.hero-path {
  align-self: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 16px;
  padding: 18px;
}

.hero-step {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 7px;
  text-align: center;
}

.hero-step ion-icon { font-size: 25px; }
.hero-step strong { font-size: 9px; }
.hero-arrow { color: #9de9e2; }

.content-section,
.reuse-section,
.ods-section {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  box-shadow: var(--agua-shadow);
  margin-bottom: 20px;
  padding: clamp(22px, 4vw, 32px);
}

.section-heading h2,
.agriculture-copy h2,
.reuse-heading h2,
.ods-section h2 {
  color: var(--agua-petroleo);
  font-size: clamp(21px, 3vw, 29px);
  line-height: 1.22;
  margin: 0;
}

.section-heading p,
.agriculture-copy p,
.reuse-heading p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.7;
  margin: 9px 0 0;
}

.timeline {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 24px;
}

.timeline-card {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 8px;
  min-height: 205px;
  padding: 18px;
  position: relative;
}

.timeline-index {
  color: color-mix(in srgb, var(--agua-agua) 18%, transparent);
  font-size: 42px;
  font-weight: 800;
  position: absolute;
  right: 13px;
  top: 7px;
}

.card-icon,
.reuse-symbol {
  align-items: center;
  background: color-mix(in srgb, var(--agua-agua) 14%, var(--agua-branco));
  border-radius: 8px;
  color: var(--agua-agua);
  display: flex;
  font-size: 21px;
  height: 40px;
  justify-content: center;
  margin-bottom: 14px;
  width: 40px;
}

.timeline-card small,
.method-card small,
.reuse-grid small,
.ods-grid small {
  color: var(--agua-agua);
  display: block;
  font-size: 9px;
  font-weight: 800;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.timeline-card h3,
.method-card h3,
.reuse-grid h3,
.ods-grid h3,
.fact-panel h3 {
  color: var(--agua-petroleo);
  font-size: 14px;
  margin: 0 0 7px;
}

.timeline-card p,
.method-card p,
.reuse-grid p,
.ods-grid p,
.fact-panel p {
  color: var(--agua-suave);
  font-size: 11px;
  line-height: 1.6;
  margin: 0;
}

.agriculture-section {
  background: color-mix(in srgb, var(--agua-agua) 10%, var(--agua-branco));
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  display: grid;
  gap: 28px;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  margin-bottom: 20px;
  padding: clamp(22px, 4vw, 34px);
}

.biology-flow {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 8px;
  margin-top: 20px;
  padding: 13px 16px;
}

.biology-flow strong,
.reuse-cycle strong { color: var(--agua-petroleo); font-size: 10px; }
.biology-flow ion-icon,
.reuse-cycle ion-icon { color: var(--agua-agua); }

.fact-panel {
  align-content: center;
  background: var(--agua-feature-bg);
  border-radius: 8px;
  display: grid;
  padding: 24px;
}

.fact-panel > span { color: #9de9e2; font-size: 34px; margin-bottom: 12px; }
.fact-panel h3 { color: #fff; font-size: 19px; }
.fact-panel p { color: #d9f4f4; }

.split-heading {
  align-items: end;
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 1fr;
}

.method-grid,
.reuse-grid,
.ods-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 24px;
}

.method-card {
  border-left: 3px solid var(--agua-agua);
  display: grid;
  gap: 12px;
  padding: 8px 12px;
}

.reuse-section {
  background: linear-gradient(145deg, color-mix(in srgb, var(--agua-agua) 8%, var(--agua-branco)), var(--agua-branco));
}

.reuse-heading {
  align-items: start;
  display: grid;
  gap: 16px;
  grid-template-columns: auto minmax(0, 1fr);
  max-width: 850px;
}

.reuse-symbol { font-size: 27px; height: 52px; width: 52px; }
.reuse-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.reuse-grid article {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 8px;
  padding: 18px;
}

.reuse-grid small {
  border-top: 1px solid var(--agua-borda);
  line-height: 1.45;
  margin: 13px 0 0;
  padding-top: 11px;
  text-transform: none;
}

.reuse-cycle {
  border-top: 1px solid var(--agua-borda);
  margin-top: 24px;
  padding-top: 20px;
}

.safety-note {
  align-items: center;
  background: color-mix(in srgb, var(--agua-alerta) 12%, var(--agua-branco));
  border-radius: 8px;
  color: var(--agua-texto);
  display: flex;
  font-size: 10px;
  gap: 9px;
  line-height: 1.5;
  margin: 18px 0 0;
  padding: 11px 13px;
}

.safety-note ion-icon { color: var(--agua-alerta); flex: 0 0 auto; font-size: 18px; }

.technology-section { align-items: center; }
.technology-section a {
  align-items: center;
  background: #fff;
  border-radius: 8px;
  color: #0d4b5e;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  gap: 8px;
  margin-top: 20px;
  min-height: 42px;
  padding: 0 15px;
  text-decoration: none;
}

.technology-flow {
  align-self: stretch;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 8px;
  padding: 20px;
}

.technology-flow div { align-items: center; display: flex; flex-direction: column; gap: 8px; text-align: center; }
.technology-flow div ion-icon { color: #9de9e2; font-size: 26px; }
.technology-flow strong { font-size: 9px; }
.technology-flow > ion-icon { color: #9de9e2; }

.ods-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ods-grid article {
  border: 1px solid var(--agua-borda);
  border-radius: 8px;
  display: grid;
  gap: 14px;
  grid-template-columns: auto 1fr;
  padding: 17px;
}

.ods-grid article > strong {
  align-items: center;
  background: color-mix(in srgb, var(--goal-color) 15%, var(--agua-branco));
  border-radius: 8px;
  color: var(--goal-color);
  display: flex;
  font-size: 20px;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.ods-grid small { color: var(--goal-color); }

@media (max-width: 1050px) {
  .story-hero,
  .technology-section { grid-template-columns: 1fr; }
  .timeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .method-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .agriculture-section,
  .split-heading { grid-template-columns: 1fr; }
  .reuse-grid,
  .ods-grid { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .story-hero { padding: 25px 20px; }
  .hero-path,
  .technology-flow { align-items: stretch; flex-direction: column; gap: 8px; }
  .hero-step,
  .technology-flow div { flex-direction: row; justify-content: flex-start; }
  .hero-arrow,
  .technology-flow > ion-icon { align-self: center; transform: rotate(90deg); }
  .timeline,
  .method-grid { grid-template-columns: 1fr; }
  .biology-flow,
  .reuse-cycle { align-items: stretch; flex-direction: column; gap: 8px; }
  .biology-flow ion-icon,
  .reuse-cycle ion-icon { align-self: center; transform: rotate(90deg); }
  .reuse-heading { grid-template-columns: 1fr; }
}
</style>
