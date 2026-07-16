<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="shell">
        <aside class="sidebar" :class="{ open: menuOpen }">
          <button class="brand" @click="activeView = 'Visão geral'; menuOpen = false">
            <span class="brand-mark"><ion-icon :icon="water" /></span>
            <span>Água<strong>+</strong></span>
          </button>

          <nav>
            <p class="nav-label">MONITORAMENTO</p>
            <button v-for="item in navPrimary" :key="item.label" :class="{ active: activeView === item.label }" @click="selectView(item.label)">
              <ion-icon :icon="item.icon" /><span>{{ item.label }}</span>
              <span v-if="item.badge" class="badge">{{ openAlerts }}</span>
            </button>
            <p class="nav-label second">GESTÃO</p>
            <button v-for="item in navSecondary" :key="item.label" :class="{ active: activeView === item.label }" @click="selectView(item.label)">
              <ion-icon :icon="item.icon" /><span>{{ item.label }}</span>
            </button>
          </nav>

          <div class="sidebar-foot">
            <div class="mini-goal">
              <span><ion-icon :icon="leaf" /> Meta do mês</span><b>78%</b>
              <div><i /></div><small>Faltam 3.240 L para a meta</small>
            </div>
            <div class="user"><span>VS</span><div><b>Vinícius Souza</b><small>Administrador</small></div><ion-icon :icon="ellipsisHorizontal" /></div>
          </div>
        </aside>

        <main>
          <header class="topbar">
            <button class="menu" @click="menuOpen = !menuOpen"><ion-icon :icon="menuOutline" /></button>
            <div><p>ESCOLA MUNICIPAL</p><h1>{{ activeView }}</h1></div>
            <div class="top-actions">
              <div class="live"><i /> Dados em tempo real</div>
              <button class="icon-button"><ion-icon :icon="notificationsOutline" /><span /></button>
              <button class="avatar">VS</button>
            </div>
          </header>

          <section v-if="activeView === 'Visão geral'" class="content">
            <div class="welcome">
              <div><h2>Bom dia, Vinícius! <span>👋</span></h2><p>Acompanhe o consumo de água da sua instituição em tempo real.</p></div>
              <button class="primary" @click="simulate"><ion-icon :icon="pulse" /> {{ simulating ? 'Simulando...' : 'Simular leitura' }}</button>
            </div>

            <div class="stats-grid">
              <article class="stat"><span class="stat-icon blue"><ion-icon :icon="water" /></span><div><small>CONSUMO HOJE</small><h3>{{ todayConsumption.toLocaleString('pt-BR') }} <em>L</em></h3><p class="good"><ion-icon :icon="trendingDown" /> 12% abaixo da média</p></div><button><ion-icon :icon="ellipsisHorizontal" /></button></article>
              <article class="stat"><span class="stat-icon green"><ion-icon :icon="leaf" /></span><div><small>ECONOMIA NO MÊS</small><h3>18.420 <em>L</em></h3><p class="good"><ion-icon :icon="arrowUp" /> 8,4% vs. mês anterior</p></div><button><ion-icon :icon="ellipsisHorizontal" /></button></article>
              <article class="stat"><span class="stat-icon amber"><ion-icon :icon="cashOutline" /></span><div><small>ECONOMIA FINANCEIRA</small><h3><em>R$</em> 276,30</h3><p>Estimativa deste mês</p></div><button><ion-icon :icon="ellipsisHorizontal" /></button></article>
              <article class="stat"><span class="stat-icon coral"><ion-icon :icon="warningOutline" /></span><div><small>ALERTAS ATIVOS</small><h3>{{ openAlerts }}</h3><p :class="openAlerts ? 'danger' : 'good'">{{ openAlerts ? 'Requerem sua atenção' : 'Tudo funcionando bem' }}</p></div><button><ion-icon :icon="ellipsisHorizontal" /></button></article>
            </div>

            <div class="dashboard-grid">
              <article class="card chart-card">
                <div class="card-head"><div><h3>Consumo nos últimos 7 dias</h3><p>Comparativo de consumo diário</p></div><div class="legend"><span><i class="current" /> Atual</span><span><i /> Média</span><button>7 dias <ion-icon :icon="chevronDown" /></button></div></div>
                <div class="chart-area">
                  <div class="y-axis"><span>4.000 L</span><span>3.000 L</span><span>2.000 L</span><span>1.000 L</span><span>0 L</span></div>
                  <div class="plot">
                    <div class="gridlines"><i v-for="n in 5" :key="n" /></div>
                    <svg viewBox="0 0 700 220" preserveAspectRatio="none" aria-label="Gráfico de consumo">
                      <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3478f6" stop-opacity=".22"/><stop offset="1" stop-color="#3478f6" stop-opacity="0"/></linearGradient></defs>
                      <path d="M0 80 C50 85 65 103 115 105 S180 76 230 88 S310 124 350 108 S425 54 470 73 S550 127 585 113 S655 71 700 82 L700 220 L0 220 Z" fill="url(#fill)" />
                      <path d="M0 80 C50 85 65 103 115 105 S180 76 230 88 S310 124 350 108 S425 54 470 73 S550 127 585 113 S655 71 700 82" fill="none" stroke="#3478f6" stroke-width="4" stroke-linecap="round" />
                      <path d="M0 105 C80 90 140 115 210 100 S330 92 420 97 S565 88 700 100" fill="none" stroke="#bdc6d6" stroke-width="3" stroke-dasharray="8 8" />
                      <circle cx="470" cy="73" r="6" fill="#fff" stroke="#3478f6" stroke-width="4" />
                    </svg>
                    <div class="x-axis"><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span><span>Seg</span><span>Ter</span><span>Hoje</span></div>
                  </div>
                </div>
              </article>

              <article class="card alert-card">
                <div class="card-head"><div><h3>Alertas recentes</h3><p>Atualizado agora</p></div><button class="link" @click="selectView('Alertas')">Ver todos <ion-icon :icon="arrowForward" /></button></div>
                <div v-if="alerts.some(a => !a.resolved)" class="alert-list">
                  <div v-for="alert in alerts.filter(a => !a.resolved)" :key="alert.id" class="alert-item">
                    <span :class="['alert-icon', alert.level]"><ion-icon :icon="alert.level === 'critical' ? warning : water" /></span>
                    <div><span :class="['severity', alert.level]">{{ alert.level === 'critical' ? 'CRÍTICO' : 'ATENÇÃO' }}</span><h4>{{ alert.title }}</h4><p>{{ alert.location }} • {{ alert.time }}</p></div>
                    <button @click="resolveAlert(alert.id)" title="Resolver"><ion-icon :icon="checkmarkCircleOutline" /></button>
                  </div>
                </div>
                <div v-else class="empty"><ion-icon :icon="checkmarkCircleOutline" /><b>Nenhum alerta ativo</b><p>Todos os pontos estão normais.</p></div>
              </article>
            </div>

            <div class="bottom-grid">
              <article class="card locations"><div class="card-head"><div><h3>Consumo por local</h3><p>Distribuição de hoje</p></div><button class="link" @click="selectView('Pontos de medição')">Detalhes <ion-icon :icon="arrowForward" /></button></div><div v-for="place in places" :key="place.name" class="location-row"><span :class="['place-icon', place.color]"><ion-icon :icon="place.icon" /></span><div><p><b>{{ place.name }}</b><span>{{ place.value.toLocaleString('pt-BR') }} L</span></p><div class="bar"><i :style="{ width: place.percent + '%', background: place.hex }" /></div></div><small>{{ place.percent }}%</small></div></article>
              <article class="card impact"><div class="impact-art"><span>🌱</span><i /><i /></div><div><small>IMPACTO AMBIENTAL</small><h3>Sua economia faz a diferença!</h3><p>Você economizou o equivalente a</p><div class="impact-value"><span><ion-icon :icon="leaf" /></span><div><b>92 árvores</b><small>em impacto ambiental</small></div></div><button @click="selectView('Relatórios')">Ver relatório de impacto <ion-icon :icon="arrowForward" /></button></div></article>
            </div>
          </section>

          <section v-else class="content module-page">
            <button class="back" @click="selectView('Visão geral')"><ion-icon :icon="arrowBack" /> Voltar à visão geral</button>
            <div class="module-hero"><span><ion-icon :icon="currentIcon" /></span><div><p>MÓDULO ÁGUA+</p><h2>{{ activeView }}</h2><p>{{ moduleDescription }}</p></div></div>
            <div v-if="activeView === 'Alertas'" class="card full-card"><div v-for="alert in alerts" :key="alert.id" class="alert-item"><span :class="['alert-icon', alert.resolved ? 'resolved' : alert.level]"><ion-icon :icon="alert.resolved ? checkmarkCircleOutline : warning" /></span><div><span :class="['severity', alert.resolved ? 'resolved' : alert.level]">{{ alert.resolved ? 'RESOLVIDO' : alert.level === 'critical' ? 'CRÍTICO' : 'ATENÇÃO' }}</span><h4>{{ alert.title }}</h4><p>{{ alert.location }} • {{ alert.time }}</p></div><button v-if="!alert.resolved" class="resolve" @click="resolveAlert(alert.id)">Resolver</button></div></div>
            <div v-else class="placeholder-grid"><article v-for="(metric, i) in moduleMetrics" :key="i" class="card placeholder-card"><span><ion-icon :icon="metric.icon" /></span><small>{{ metric.label }}</small><h3>{{ metric.value }}</h3><p>{{ metric.note }}</p></article></div>
          </section>
        </main>
        <div v-if="menuOpen" class="overlay" @click="menuOpen = false" />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { alertCircleOutline, analyticsOutline, arrowBack, arrowForward, arrowUp, businessOutline, cashOutline, checkmarkCircleOutline, chevronDown, ellipsisHorizontal, flashOutline, leaf, menuOutline, notificationsOutline, peopleOutline, pulse, readerOutline, schoolOutline, settingsOutline, speedometerOutline, storefrontOutline, trendingDown, trophyOutline, warning, warningOutline, water } from 'ionicons/icons';

const activeView = ref('Visão geral');
const menuOpen = ref(false);
const simulating = ref(false);
const todayConsumption = ref(2847);
const alerts = ref([
  { id: 1, level: 'critical', title: 'Vazamento detectado', location: 'Banheiro • Bloco B', time: 'há 12 min', resolved: false },
  { id: 2, level: 'warning', title: 'Consumo acima da média', location: 'Cozinha', time: 'há 38 min', resolved: false },
  { id: 3, level: 'warning', title: 'Fluxo contínuo incomum', location: 'Bebedouro • Pátio', time: 'ontem, 17:42', resolved: true },
]);
const openAlerts = computed(() => alerts.value.filter(a => !a.resolved).length);
const navPrimary = [
  { label: 'Visão geral', icon: speedometerOutline }, { label: 'Monitoramento', icon: pulse }, { label: 'Pontos de medição', icon: flashOutline }, { label: 'Alertas', icon: alertCircleOutline, badge: true },
];
const navSecondary = [
  { label: 'Ordens de serviço', icon: readerOutline }, { label: 'Metas e ranking', icon: trophyOutline }, { label: 'Relatórios', icon: analyticsOutline }, { label: 'Configurações', icon: settingsOutline },
];
const places = [
  { name: 'Banheiros', value: 1054, percent: 37, color: 'blue', hex: '#3478f6', icon: water },
  { name: 'Cozinha', value: 762, percent: 27, color: 'purple', hex: '#8768ed', icon: storefrontOutline },
  { name: 'Jardins', value: 598, percent: 21, color: 'green', hex: '#37b982', icon: leaf },
  { name: 'Outros', value: 433, percent: 15, color: 'amber', hex: '#f1a83b', icon: businessOutline },
];
const iconMap: Record<string, string> = Object.fromEntries([...navPrimary, ...navSecondary].map(i => [i.label, i.icon]));
const currentIcon = computed(() => iconMap[activeView.value] || water);
const descriptions: Record<string, string> = {
  'Monitoramento': 'Acompanhe a vazão dos sensores e o consumo em tempo real.', 'Pontos de medição': 'Gerencie os sensores instalados em cada ambiente.', 'Alertas': 'Investigue anomalias e resolva ocorrências rapidamente.', 'Ordens de serviço': 'Organize os chamados enviados à equipe de manutenção.', 'Metas e ranking': 'Engaje turmas e setores em uma competição sustentável.', 'Relatórios': 'Analise economia financeira e impacto ambiental.', 'Configurações': 'Personalize regras, horários e dados da instituição.',
};
const moduleDescription = computed(() => descriptions[activeView.value]);
const moduleMetrics = computed(() => {
  const sets: Record<string, any[]> = {
    'Monitoramento': [{ label: 'VAZÃO TOTAL', value: '4,2 L/min', note: '12 sensores online', icon: pulse }, { label: 'PICO HOJE', value: '18,7 L/min', note: 'às 10:34', icon: arrowUp }, { label: 'STATUS', value: 'Operando', note: '98,7% de disponibilidade', icon: checkmarkCircleOutline }],
    'Pontos de medição': [{ label: 'CADASTRADOS', value: '14 pontos', note: '12 ativos agora', icon: flashOutline }, { label: 'BLOCOS', value: '4 áreas', note: 'Cobertura completa', icon: businessOutline }, { label: 'MANUTENÇÃO', value: '2 pontos', note: 'Aguardando inspeção', icon: settingsOutline }],
    'Ordens de serviço': [{ label: 'EM ABERTO', value: '2 ordens', note: '1 de alta prioridade', icon: readerOutline }, { label: 'CONCLUÍDAS', value: '18', note: 'Nos últimos 30 dias', icon: checkmarkCircleOutline }, { label: 'TEMPO MÉDIO', value: '1h 42min', note: '12% mais rápido', icon: pulse }],
    'Metas e ranking': [{ label: 'LÍDER', value: 'Turma 8º A', note: '1.840 créditos', icon: trophyOutline }, { label: 'META GERAL', value: '78%', note: 'Faltam 3.240 litros', icon: leaf }, { label: 'PARTICIPANTES', value: '12 equipes', note: '346 estudantes', icon: peopleOutline }],
    'Relatórios': [{ label: 'ECONOMIA', value: '18.420 L', note: 'Neste mês', icon: water }, { label: 'FINANCEIRO', value: 'R$ 276,30', note: 'Estimativa acumulada', icon: cashOutline }, { label: 'IMPACTO', value: '92 árvores', note: 'Equivalência ambiental', icon: leaf }],
    'Configurações': [{ label: 'INSTITUIÇÃO', value: 'Escola Municipal', note: 'Perfil atualizado', icon: schoolOutline }, { label: 'USUÁRIOS', value: '8 acessos', note: '3 administradores', icon: peopleOutline }, { label: 'INTEGRAÇÕES', value: '12 sensores', note: 'Todos sincronizados', icon: settingsOutline }],
  };
  return sets[activeView.value] || [];
});
function selectView(view: string) { activeView.value = view; menuOpen.value = false; }
function resolveAlert(id: number) { const a = alerts.value.find(item => item.id === id); if (a) a.resolved = true; }
function simulate() { simulating.value = true; let ticks = 0; const timer = setInterval(() => { todayConsumption.value += Math.floor(Math.random() * 8) + 2; if (++ticks === 6) { clearInterval(timer); simulating.value = false; } }, 180); }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');
*{box-sizing:border-box}.shell{min-height:100%;display:flex;background:#f4f7fb;color:#13213d;font-family:'DM Sans',sans-serif}.sidebar{width:252px;background:#fff;border-right:1px solid #e8edf4;padding:28px 18px 20px;display:flex;flex-direction:column;position:fixed;inset:0 auto 0 0;z-index:20}.brand{display:flex;align-items:center;gap:12px;background:none;border:0;padding:0 10px 29px;color:#12223e;font:800 25px 'Manrope';cursor:pointer}.brand strong{color:#36b98b}.brand-mark{width:38px;height:38px;border-radius:12px;background:#2875f4;color:#fff;display:grid;place-items:center;font-size:22px;box-shadow:0 8px 18px #2875f42f}.nav-label{font-size:10px;color:#a2acbc;font-weight:700;letter-spacing:1.4px;margin:8px 13px 9px}.nav-label.second{margin-top:28px}.sidebar nav button{width:100%;height:44px;border:0;border-radius:9px;background:transparent;color:#68758b;display:flex;align-items:center;gap:13px;padding:0 13px;font:500 14px 'DM Sans';cursor:pointer;margin:2px 0;text-align:left}.sidebar nav button ion-icon{font-size:19px}.sidebar nav button:hover{background:#f5f8fd;color:#2875f4}.sidebar nav button.active{background:#edf4ff;color:#2875f4;font-weight:700}.badge{margin-left:auto;background:#ff6262;color:#fff;border-radius:12px;min-width:21px;height:21px;display:grid;place-items:center;font-size:11px}.sidebar-foot{margin-top:auto}.mini-goal{background:#f1f8f5;padding:14px;border-radius:12px;font-size:11px;color:#778597}.mini-goal>span{font-weight:700;color:#2c8669}.mini-goal>span ion-icon{vertical-align:-2px}.mini-goal>b{float:right;color:#36a77f}.mini-goal>div{height:5px;background:#dce9e3;border-radius:5px;margin:9px 0 7px;overflow:hidden}.mini-goal i{display:block;width:78%;height:100%;background:#35b987}.user{display:flex;align-items:center;gap:10px;border-top:1px solid #edf0f5;margin-top:17px;padding:17px 5px 0}.user>span,.avatar{width:34px;height:34px;border-radius:50%;background:#dbe9ff;color:#2875f4;display:grid;place-items:center;font-size:11px;font-weight:700}.user div{display:flex;flex-direction:column;min-width:0}.user b{font-size:12px}.user small{color:#8b96a8;font-size:10px}.user>ion-icon{margin-left:auto;color:#a9b1bf}main{width:calc(100% - 252px);margin-left:252px}.topbar{height:85px;background:#fff;border-bottom:1px solid #e8edf4;padding:0 34px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}.topbar p{font-size:9px;letter-spacing:1.2px;color:#9ca7b7;font-weight:700;margin:0 0 3px}.topbar h1{font:800 21px 'Manrope';margin:0}.top-actions{display:flex;gap:15px;align-items:center}.live{color:#657187;background:#f7f9fc;border:1px solid #e7ebf1;padding:9px 13px;border-radius:20px;font-size:11px}.live i{display:inline-block;width:7px;height:7px;background:#39bb84;border-radius:50%;margin-right:6px;box-shadow:0 0 0 4px #39bb8424}.icon-button,.avatar,.menu{border:0;cursor:pointer}.icon-button{position:relative;background:none;color:#68758a;font-size:20px}.icon-button span{position:absolute;width:6px;height:6px;border-radius:50%;background:#ff6666;right:1px;top:1px}.avatar{border:2px solid #fff;box-shadow:0 0 0 1px #d9e0eb}.menu{display:none;background:none;font-size:25px}.content{padding:30px 34px 44px;max-width:1600px;margin:auto}.welcome{display:flex;align-items:center;justify-content:space-between;margin-bottom:25px}.welcome h2{font:800 22px 'Manrope';margin:0 0 6px}.welcome h2 span{font-size:20px}.welcome p,.card-head p{margin:0;color:#8490a4;font-size:12px}.primary{height:40px;border:0;background:#2875f4;color:#fff;border-radius:9px;padding:0 16px;font:600 12px 'DM Sans';box-shadow:0 7px 16px #2875f42b;cursor:pointer}.primary ion-icon{vertical-align:-3px;font-size:17px;margin-right:7px}.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.stat,.card{background:#fff;border:1px solid #e6ebf2;border-radius:13px;box-shadow:0 3px 12px rgba(26,44,74,.035)}.stat{padding:18px;display:flex;gap:13px;position:relative}.stat-icon{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;font-size:20px;flex:0 0 auto}.blue{background:#eaf2ff;color:#2875f4}.green{background:#e9f8f2;color:#33af82}.amber{background:#fff4e4;color:#eda039}.coral{background:#ffeded;color:#f06060}.purple{background:#f0ecff;color:#8065df}.stat small,.impact small,.placeholder-card small{font-size:9px;letter-spacing:.7px;color:#929dad;font-weight:700}.stat h3{font:800 21px 'Manrope';margin:3px 0}.stat h3 em{font:600 11px 'DM Sans';font-style:normal;color:#718096}.stat p{font-size:10px;color:#8a95a6;margin:0}.good{color:#2cac7c!important}.danger{color:#e95959!important}.stat>button{position:absolute;right:10px;top:10px;border:0;background:none;color:#b3bbc8}.dashboard-grid{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(320px,.8fr);gap:16px;margin-top:16px}.card{padding:20px}.card-head{display:flex;justify-content:space-between;align-items:flex-start}.card-head h3{font:700 14px 'Manrope';margin:0 0 4px}.legend{display:flex;align-items:center;gap:14px;font-size:10px;color:#8490a4}.legend span i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#bfc8d5;margin-right:5px}.legend span i.current{background:#3478f6}.legend button{border:1px solid #e5eaf1;background:#fff;border-radius:7px;padding:7px 9px;color:#627086;font-size:10px}.chart-area{height:250px;display:flex;padding-top:22px}.y-axis{width:46px;display:flex;flex-direction:column;justify-content:space-between;padding-bottom:22px;color:#a4adba;font-size:9px}.plot{flex:1;position:relative;padding-bottom:22px}.gridlines{position:absolute;inset:0 0 22px;display:flex;flex-direction:column;justify-content:space-between}.gridlines i{height:1px;background:#edf0f4}.plot svg{position:absolute;inset:0 0 22px;width:100%;height:calc(100% - 22px);overflow:visible}.x-axis{position:absolute;inset:auto 0 0;display:flex;justify-content:space-between;color:#929cac;font-size:9px}.link{border:0;background:transparent;color:#2875f4;font-size:10px;font-weight:700;cursor:pointer}.link ion-icon{vertical-align:-2px}.alert-list{margin-top:12px}.alert-item{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #eef1f5}.alert-item:last-child{border-bottom:0}.alert-icon{width:37px;height:37px;border-radius:9px;display:grid;place-items:center;flex:0 0 auto}.alert-icon.critical{background:#ffeded;color:#ec5e5e}.alert-icon.warning{background:#fff3e2;color:#efa13a}.alert-icon.resolved{background:#e8f8f1;color:#32af7f}.alert-item>div{min-width:0;flex:1}.severity{font-size:8px;font-weight:800;letter-spacing:.7px}.severity.critical{color:#eb5757}.severity.warning{color:#e69b31}.severity.resolved{color:#32af7f}.alert-item h4{font-size:12px;margin:2px 0}.alert-item p{color:#929cab;font-size:9px;margin:0}.alert-item>button:not(.resolve){border:0;background:none;color:#adb5c2;font-size:20px;cursor:pointer}.resolve{border:0;border-radius:7px;background:#edf4ff;color:#2875f4;font:600 10px 'DM Sans';padding:8px 12px;cursor:pointer}.empty{text-align:center;padding:34px 0 14px;color:#2cac7c}.empty ion-icon{display:block;font-size:36px;margin:auto}.empty b{font-size:12px}.empty p{font-size:10px;color:#929cab}.bottom-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:16px;margin-top:16px}.location-row{display:flex;align-items:center;gap:12px;margin-top:15px}.place-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;flex:0 0 auto}.location-row>div{flex:1}.location-row p{display:flex;justify-content:space-between;font-size:10px;margin:0 0 6px}.location-row p span{color:#56657c;font-weight:600}.location-row small{font-size:9px;color:#8d97a7;width:24px;text-align:right}.bar{height:4px;border-radius:4px;background:#edf1f5}.bar i{display:block;height:100%;border-radius:4px}.impact{display:flex;align-items:center;padding:0;overflow:hidden}.impact-art{width:42%;height:100%;min-height:210px;background:linear-gradient(145deg,#e6f8ef,#d5f0e6);position:relative;display:grid;place-items:center}.impact-art span{font-size:62px;filter:drop-shadow(0 10px 10px #3f8b6b3b)}.impact-art i{position:absolute;border-radius:50%;background:#fff6;width:100px;height:100px}.impact-art i:first-of-type{left:-45px;bottom:-30px}.impact-art i:last-of-type{right:-40px;top:-30px}.impact>div:last-child{padding:23px}.impact h3{font:700 16px 'Manrope';margin:5px 0}.impact p{font-size:10px;color:#8691a2}.impact-value{display:flex;align-items:center;gap:10px;margin:15px 0}.impact-value>span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e8f7f0;color:#32b181}.impact-value div{display:flex;flex-direction:column}.impact-value b{font:700 13px 'Manrope'}.impact-value small{letter-spacing:0;font-size:9px}.impact button{border:0;background:transparent;color:#2875f4;font-size:10px;font-weight:700;padding:0;cursor:pointer}.module-page{min-height:calc(100vh - 85px)}.back{border:0;background:none;color:#6f7e94;padding:0;margin-bottom:24px;cursor:pointer}.back ion-icon{vertical-align:-2px}.module-hero{background:linear-gradient(135deg,#246ff0,#3b8bf9);border-radius:16px;color:#fff;padding:30px;display:flex;align-items:center;gap:20px;box-shadow:0 14px 30px #2875f42b}.module-hero>span{width:62px;height:62px;border-radius:15px;background:#fff2;display:grid;place-items:center;font-size:30px}.module-hero p{margin:0 0 4px;font-size:11px;opacity:.8}.module-hero h2{font:800 28px 'Manrope';margin:0 0 5px}.placeholder-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}.placeholder-card>span{width:42px;height:42px;border-radius:10px;background:#edf4ff;color:#2875f4;display:grid;place-items:center;font-size:20px;margin-bottom:18px}.placeholder-card h3{font:800 22px 'Manrope';margin:5px 0}.placeholder-card p{font-size:11px;color:#8a96a7}.full-card{margin-top:20px}.overlay{display:none}
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,1fr)}.dashboard-grid{grid-template-columns:1fr}.bottom-grid{grid-template-columns:1fr}}
@media(max-width:760px){.sidebar{transform:translateX(-100%);transition:.25s}.sidebar.open{transform:translateX(0)}main{width:100%;margin-left:0}.menu{display:block}.topbar{padding:0 18px;justify-content:flex-start;gap:14px}.top-actions{margin-left:auto}.live{display:none}.content{padding:22px 16px}.welcome{align-items:flex-start;gap:15px}.welcome p{max-width:220px}.stats-grid{grid-template-columns:1fr}.legend{display:none}.bottom-grid,.placeholder-grid{grid-template-columns:1fr}.overlay{display:block;position:fixed;inset:0;background:#10203d66;z-index:15}.impact-art{display:none}.module-hero{padding:22px}.module-hero h2{font-size:22px}}
</style>
