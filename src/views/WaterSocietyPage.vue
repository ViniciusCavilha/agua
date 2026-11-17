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

          <p class="interaction-hint">Selecione um período para descobrir o que ele deixou como legado.</p>

          <div class="timeline">
            <article
              v-for="(period, index) in historyPeriods"
              :key="period.title"
              class="timeline-item"
              :class="{ open: selectedHistory === index }"
            >
              <button
                type="button"
                class="timeline-card"
                :class="{ active: selectedHistory === index }"
                :aria-expanded="selectedHistory === index"
                @click="selectedHistory = selectedHistory === index ? null : index"
              >
                <div class="timeline-index">{{ String(index + 1).padStart(2, '0') }}</div>
                <span class="card-icon"><ion-icon :icon="period.icon" /></span>
                <small>{{ period.period }}</small>
                <h3>{{ period.title }}</h3>
                <p>{{ period.description }}</p>
                <span class="card-action">
                  {{ selectedHistory === index ? 'Fechar detalhes' : 'Descobrir o legado' }}
                  <ion-icon :icon="chevronDownOutline" />
                </span>
              </button>

              <Transition name="timeline-reveal">
                <div v-if="selectedHistory === index" class="timeline-detail" aria-live="polite">
                  <span class="discovery-icon"><ion-icon :icon="period.icon" /></span>
                  <div>
                    <small>Legado para o presente</small>
                    <h3>{{ period.legacyTitle }}</h3>
                    <p>{{ period.legacy }}</p>
                  </div>
                </div>
              </Transition>
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

          <p class="interaction-hint">Compare as técnicas para entender onde cada uma funciona melhor.</p>

          <div class="method-grid">
            <button
              v-for="(method, index) in irrigationMethods"
              :key="method.title"
              type="button"
              class="method-card"
              :class="{ active: selectedIrrigation === index }"
              :aria-pressed="selectedIrrigation === index"
              @click="selectedIrrigation = index"
            >
              <span class="card-icon"><ion-icon :icon="method.icon" /></span>
              <div>
                <small>{{ method.period }}</small>
                <h3>{{ method.title }}</h3>
                <p>{{ method.description }}</p>
              </div>
            </button>
          </div>

          <div class="discovery-panel method-discovery" aria-live="polite">
            <div class="comparison-item">
              <small>Eficiência relativa</small>
              <strong>{{ irrigationMethods[selectedIrrigation].efficiency }}</strong>
            </div>
            <div class="comparison-item">
              <small>Principal vantagem</small>
              <strong>{{ irrigationMethods[selectedIrrigation].advantage }}</strong>
            </div>
            <div class="comparison-item">
              <small>Ponto de atenção</small>
              <strong>{{ irrigationMethods[selectedIrrigation].attention }}</strong>
            </div>
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
            <article v-for="(item, index) in reuseOptions" :key="item.title" :class="{ open: expandedReuse === index }">
              <button
                type="button"
                class="reuse-toggle"
                :aria-expanded="expandedReuse === index"
                @click="expandedReuse = expandedReuse === index ? null : index"
              >
                <span class="card-icon"><ion-icon :icon="item.icon" /></span>
                <span class="reuse-copy">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                  <small>{{ item.application }}</small>
                </span>
                <ion-icon class="expand-icon" :icon="chevronDownOutline" />
              </button>
              <div v-if="expandedReuse === index" class="reuse-details" aria-live="polite">
                <strong>Como aplicar com segurança</strong>
                <p>{{ item.guidance }}</p>
              </div>
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
import { ref } from 'vue';
import {
  analyticsOutline,
  arrowForwardOutline,
  businessOutline,
  chevronDownOutline,
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
  { period: 'Há cerca de 12 mil anos', title: 'Revolução Agrícola', description: 'O cultivo e a domesticação de plantas favoreceram comunidades fixas e aumentaram a necessidade de administrar água.', legacyTitle: 'A água ajudou a transformar grupos nômades em comunidades permanentes.', legacy: 'Ao depender do plantio, as populações passaram a observar estações, chuvas e rios. Essa organização criou novas formas de trabalho, armazenamento de alimentos e ocupação do território.', icon: nutritionOutline },
  { period: 'Antiguidade', title: 'Primeiras civilizações', description: 'Povos próximos a grandes rios desenvolveram canais, diques e reservatórios para irrigar plantações e abastecer cidades.', legacyTitle: 'Obras hidráulicas se tornaram parte da organização social.', legacy: 'Controlar cheias e distribuir água exigia planejamento coletivo. Rios como o Nilo, Tigre, Eufrates e Indo influenciaram a economia, a política e a cultura de diferentes povos.', icon: libraryOutline },
  { period: 'Períodos medieval e moderno', title: 'Expansão agrícola', description: 'Poços, rodas-d’água e técnicas regionais ampliaram o transporte e o aproveitamento da água.', legacyTitle: 'A energia da água também passou a movimentar a produção.', legacy: 'Rodas-d’água ajudaram na moagem de grãos e em outras tarefas. Conhecimentos hidráulicos circularam entre regiões e foram adaptados às condições locais.', icon: settingsOutline },
  { period: 'Revolução Industrial', title: 'Crescimento urbano', description: 'Bombas, tubulações e redes de abastecimento acompanharam a industrialização e o aumento das cidades.', legacyTitle: 'Abastecimento e saneamento se tornaram desafios urbanos.', legacy: 'A concentração populacional aumentou a demanda e evidenciou a relação entre água contaminada e doenças, impulsionando redes públicas de tratamento e distribuição.', icon: businessOutline },
  { period: 'Séculos XX e XXI', title: 'Agricultura contemporânea', description: 'Aspersão e gotejamento tornaram a irrigação mais controlável, mas a demanda crescente trouxe novos desafios ambientais.', legacyTitle: 'A produtividade cresceu, assim como a responsabilidade ambiental.', legacy: 'A mecanização permitiu produzir em maior escala, mas o uso intensivo mostrou a necessidade de evitar perdas, proteger o solo e respeitar a disponibilidade de cada bacia hidrográfica.', icon: rainyOutline },
  { period: 'Presente e futuro', title: 'Gestão inteligente', description: 'Sensores e dados permitem identificar consumo, desperdício e oportunidades de reutilização com mais precisão.', legacyTitle: 'Medir permite agir antes que a água seja desperdiçada.', legacy: 'Sensores conectados podem revelar vazamentos, comparar períodos e orientar decisões. A tecnologia complementa, mas não substitui, práticas responsáveis e políticas de preservação.', icon: analyticsOutline },
];

const biologySteps = ['Solo', 'Raízes', 'Caule', 'Folhas', 'Atmosfera'];

const irrigationMethods = [
  { period: 'Técnica tradicional', title: 'Canais e sulcos', description: 'A gravidade distribui a água pelo terreno, com baixo custo e maior possibilidade de perdas.', efficiency: 'Baixa a moderada', advantage: 'Estrutura simples e menor investimento inicial.', attention: 'Pode perder água por infiltração, escoamento e evaporação.', icon: waterOutline },
  { period: 'Mecanização', title: 'Aspersão', description: 'A água é lançada sobre a plantação, simulando chuva e cobrindo áreas maiores.', efficiency: 'Moderada', advantage: 'Distribui água em áreas amplas e terrenos variados.', attention: 'Vento e calor podem desviar ou evaporar parte da água.', icon: rainyOutline },
  { period: 'Eficiência', title: 'Gotejamento', description: 'Pequenas quantidades chegam próximas às raízes, reduzindo evaporação e desperdício.', efficiency: 'Alta', advantage: 'Aplica água diretamente perto das raízes.', attention: 'Exige filtragem, manutenção e prevenção de entupimentos.', icon: leafOutline },
  { period: 'Agricultura de precisão', title: 'Irrigação monitorada', description: 'Sensores orientam quando e quanto irrigar de acordo com dados do ambiente e do consumo.', efficiency: 'Ajustável por dados', advantage: 'Evita irrigar quando a planta ou o solo não precisam.', attention: 'Depende de calibração, conectividade e interpretação correta.', icon: hardwareChipOutline },
];

const reuseOptions = [
  { title: 'Água da chuva', description: 'Pode ser captada em telhados e armazenada de forma protegida.', application: 'Uso possível: limpeza e irrigação, conforme o sistema instalado.', guidance: 'A primeira água da chuva pode carregar sujeira do telhado e deve ser descartada por um separador. O reservatório precisa permanecer fechado, limpo e protegido contra mosquitos.', icon: rainyOutline },
  { title: 'Águas cinzas tratadas', description: 'Água de lavatórios e chuveiros pode ser reaproveitada após tratamento específico.', application: 'Uso possível: descargas e irrigação compatível com normas sanitárias.', guidance: 'A rede deve ser separada da água potável. O tratamento varia conforme a origem e o uso final, e não se deve incluir água de vasos sanitários ou pias com gordura nesse grupo.', icon: refreshOutline },
  { title: 'Retorno planejado', description: 'Na agricultura, sistemas adequados podem recuperar parte da água e controlar uma nova aplicação.', application: 'Benefício: menor retirada das fontes e melhor aproveitamento do recurso.', guidance: 'É necessário acompanhar qualidade, sais e possíveis contaminantes para não prejudicar o solo nem as plantas. O retorno deve fazer parte de um projeto técnico adequado à cultura.', icon: leafOutline },
];

const selectedHistory = ref(null);
const selectedIrrigation = ref(0);
const expandedReuse = ref(null);

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

.interaction-hint {
  align-items: center;
  color: var(--agua-agua);
  display: flex;
  font-size: 10px;
  font-weight: 700;
  gap: 7px;
  margin: 18px 0 0;
}

.interaction-hint::before {
  background: var(--agua-agua);
  border-radius: 50%;
  content: '';
  height: 6px;
  width: 6px;
}

.timeline {
  align-items: start;
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 24px;
}

.timeline-item {
  display: grid;
  min-width: 0;
}

.timeline-card {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  min-height: 205px;
  padding: 18px;
  position: relative;
  text-align: left;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
  width: 100%;
}

.timeline-card:hover,
.timeline-card:focus-visible,
.timeline-card.active {
  border-color: var(--agua-agua);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--agua-agua) 14%, transparent);
  outline: none;
  transform: translateY(-2px);
}

.timeline-card.active {
  background: color-mix(in srgb, var(--agua-agua) 8%, var(--agua-branco));
  border-radius: 8px 8px 0 0;
  transform: none;
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

.card-action {
  align-items: center;
  color: var(--agua-agua);
  display: flex;
  font-size: 9px;
  font-weight: 800;
  gap: 5px;
  justify-content: space-between;
  margin-top: 14px;
}

.card-action ion-icon {
  font-size: 16px;
  transition: transform 180ms ease;
}

.timeline-card.active .card-action ion-icon {
  transform: rotate(180deg);
}

.timeline-detail {
  align-items: start;
  background: linear-gradient(145deg, color-mix(in srgb, var(--agua-agua) 13%, var(--agua-branco)), var(--agua-branco));
  border: 1px solid var(--agua-agua);
  border-radius: 0 0 8px 8px;
  border-top: 0;
  display: grid;
  gap: 12px;
  grid-template-columns: auto 1fr;
  padding: 17px;
  transform-origin: top;
}

.timeline-detail small {
  color: var(--agua-agua);
  display: block;
  font-size: 9px;
  font-weight: 800;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.timeline-detail h3 {
  color: var(--agua-petroleo);
  font-size: 13px;
  line-height: 1.4;
  margin: 0 0 6px;
}

.timeline-detail p {
  color: var(--agua-suave);
  font-size: 10px;
  line-height: 1.65;
  margin: 0;
}

.timeline-reveal-enter-active,
.timeline-reveal-leave-active {
  overflow: hidden;
  transition: opacity 180ms ease, transform 180ms ease;
}

.timeline-reveal-enter-from,
.timeline-reveal-leave-to {
  opacity: 0;
  transform: translateY(-8px) scaleY(0.96);
}

.discovery-panel {
  background: color-mix(in srgb, var(--agua-agua) 8%, var(--agua-branco));
  border: 1px solid color-mix(in srgb, var(--agua-agua) 35%, var(--agua-borda));
  border-radius: 8px;
  display: grid;
  gap: 14px;
  margin-top: 18px;
  padding: 18px;
}

.discovery-icon {
  align-items: center;
  background: var(--agua-agua);
  border-radius: 8px;
  color: #fff;
  display: flex;
  font-size: 22px;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.discovery-panel small,
.comparison-item small {
  color: var(--agua-agua);
  display: block;
  font-size: 9px;
  font-weight: 800;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.discovery-panel h3 {
  color: var(--agua-petroleo);
  font-size: 15px;
  margin: 0 0 5px;
}

.discovery-panel p {
  color: var(--agua-suave);
  font-size: 11px;
  line-height: 1.65;
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
  background: transparent;
  border-bottom: 0;
  border-left: 3px solid var(--agua-agua);
  border-right: 0;
  border-top: 0;
  cursor: pointer;
  display: grid;
  font-family: inherit;
  gap: 12px;
  padding: 8px 12px;
  text-align: left;
  transition: background 160ms ease, transform 160ms ease;
}

.method-card:hover,
.method-card:focus-visible,
.method-card.active {
  background: color-mix(in srgb, var(--agua-agua) 8%, transparent);
  outline: none;
  transform: translateX(3px);
}

.method-discovery {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.comparison-item {
  border-right: 1px solid var(--agua-borda);
  padding: 2px 16px 2px 2px;
}

.comparison-item:last-child { border-right: 0; }

.comparison-item strong {
  color: var(--agua-petroleo);
  display: block;
  font-size: 11px;
  line-height: 1.5;
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
  overflow: hidden;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.reuse-grid article.open {
  border-color: var(--agua-agua);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--agua-agua) 12%, transparent);
}

.reuse-toggle {
  align-items: start;
  background: transparent;
  border: 0;
  cursor: pointer;
  display: grid;
  font-family: inherit;
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: 18px;
  text-align: left;
  width: 100%;
}

.reuse-toggle:focus-visible {
  outline: 2px solid var(--agua-agua);
  outline-offset: -3px;
}

.reuse-copy { display: block; }
.reuse-toggle .card-icon { margin-bottom: 0; margin-right: 12px; }

.expand-icon {
  color: var(--agua-agua);
  font-size: 19px;
  margin-left: 10px;
  margin-top: 10px;
  transition: transform 160ms ease;
}

.reuse-grid article.open .expand-icon { transform: rotate(180deg); }

.reuse-details {
  background: color-mix(in srgb, var(--agua-agua) 8%, var(--agua-branco));
  border-top: 1px solid var(--agua-borda);
  padding: 15px 18px 17px;
}

.reuse-details strong {
  color: var(--agua-petroleo);
  display: block;
  font-size: 10px;
  margin-bottom: 5px;
}

.reuse-details p {
  color: var(--agua-suave);
  font-size: 10px;
  line-height: 1.6;
  margin: 0;
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
  .method-discovery { grid-template-columns: 1fr; }
  .comparison-item { border-bottom: 1px solid var(--agua-borda); border-right: 0; padding: 2px 0 12px; }
  .comparison-item:last-child { border-bottom: 0; padding-bottom: 2px; }
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
