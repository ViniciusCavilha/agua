<template>
  <main class="app-shell">
    <aside class="sidebar" aria-label="Navegacao principal">
      <router-link class="brand" to="/dashboard" aria-label="Agua+ dashboard">
        <span><ion-icon :icon="waterOutline" /></span>
        Agua<b>+</b>
      </router-link>

      <nav class="side-nav">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }">
          <ion-icon :icon="item.icon" />
          {{ item.label }}
        </router-link>
      </nav>

      <button class="settings" type="button">
        <ion-icon :icon="settingsOutline" />
        Configuracoes
      </button>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <button class="icon-button mobile-only" type="button" aria-label="Abrir menu">
          <ion-icon :icon="menuOutline" />
        </button>
        <div>
          <p>{{ eyebrow }}</p>
          <h1>{{ title }}</h1>
        </div>
        <button v-if="showPeriod" class="period" type="button">
          {{ periodLabel }}
          <ion-icon :icon="chevronDownOutline" />
        </button>
        <button class="icon-button" type="button" aria-label="Notificacoes">
          <ion-icon :icon="notificationsOutline" />
          <i />
        </button>
      </header>

      <slot />
    </section>

    <nav class="bottom-nav" aria-label="Navegacao mobile">
      <router-link v-for="item in navItems" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }">
        <ion-icon :icon="item.icon" />
        <span>{{ item.shortLabel }}</span>
      </router-link>
    </nav>
  </main>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import {
  barChartOutline,
  chevronDownOutline,
  homeOutline,
  menuOutline,
  notificationsOutline,
  personOutline,
  pieChartOutline,
  settingsOutline,
  waterOutline,
} from 'ionicons/icons';

defineProps({
  title: {
    type: String,
    required: true,
  },
  eyebrow: {
    type: String,
    default: 'Ola, Vinicius',
  },
  periodLabel: {
    type: String,
    default: 'Hoje',
  },
  showPeriod: {
    type: Boolean,
    default: true,
  },
});

const route = useRoute();

const navItems = [
  { label: 'Inicio', shortLabel: 'Inicio', to: '/dashboard', icon: homeOutline },
  { label: 'Consumo', shortLabel: 'Consumo', to: '/consumo', icon: barChartOutline },
  { label: 'Metas', shortLabel: 'Metas', to: '/metas', icon: pieChartOutline },
  { label: 'Perfil', shortLabel: 'Perfil', to: '/perfil', icon: personOutline },
];

const isActive = (path) => route.path === path;
</script>

<style scoped>
.app-shell {
  background: var(--agua-claro);
  color: var(--agua-texto);
  display: grid;
  font-family: Poppins, sans-serif;
  grid-template-columns: 248px 1fr;
  min-height: 100%;
}

.sidebar {
  background: var(--agua-petroleo);
  color: var(--agua-branco);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 28px 18px;
  position: sticky;
  top: 0;
}

.brand {
  align-items: center;
  color: var(--agua-branco);
  display: inline-flex;
  font-size: 23px;
  font-weight: 700;
  gap: 9px;
  text-decoration: none;
}

.brand span {
  background: rgba(255, 255, 255, 0.13);
  border-radius: 13px;
  color: #7de2d9;
  display: grid;
  height: 40px;
  place-items: center;
  width: 40px;
}

.brand b {
  color: #7de2d9;
}

.side-nav {
  display: grid;
  gap: 6px;
  margin-top: 42px;
}

.side-nav a,
.settings {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.74);
  cursor: pointer;
  display: flex;
  font: 600 13px Poppins, sans-serif;
  gap: 10px;
  min-height: 44px;
  padding: 0 12px;
  text-align: left;
  text-decoration: none;
}

.side-nav a.active,
.side-nav a:hover,
.settings:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--agua-branco);
}

.side-nav ion-icon,
.settings ion-icon {
  font-size: 19px;
}

.settings {
  margin-top: auto;
}

.workspace {
  margin: 0 auto;
  max-width: 1180px;
  padding: 28px clamp(18px, 4vw, 44px) 34px;
  width: 100%;
}

.topbar {
  align-items: center;
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr auto auto;
  margin-bottom: 24px;
}

.topbar p {
  color: var(--agua-suave);
  font-size: 13px;
  margin: 0 0 2px;
}

.topbar h1 {
  color: var(--agua-petroleo);
  font-size: clamp(28px, 4vw, 38px);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.1;
  margin: 0;
}

.icon-button,
.period {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  color: var(--agua-petroleo);
  cursor: pointer;
  min-height: 44px;
}

.icon-button {
  display: grid;
  font-size: 21px;
  place-items: center;
  position: relative;
  width: 44px;
}

.icon-button i {
  background: var(--agua-erro);
  border: 2px solid var(--agua-branco);
  border-radius: 50%;
  height: 9px;
  position: absolute;
  right: 10px;
  top: 10px;
  width: 9px;
}

.period {
  align-items: center;
  display: inline-flex;
  font: 600 13px Poppins, sans-serif;
  gap: 6px;
  padding: 0 14px;
}

.mobile-only,
.bottom-nav {
  display: none;
}

@media (max-width: 980px) {
  .app-shell {
    display: block;
    padding-bottom: 84px;
  }

  .sidebar {
    display: none;
  }

  .workspace {
    padding: 22px 18px;
  }

  .topbar {
    grid-template-columns: auto 1fr auto auto;
  }

  .mobile-only {
    display: grid;
  }

  .bottom-nav {
    background: var(--agua-branco);
    border-top: 1px solid #e3e9e9;
    bottom: 0;
    display: flex;
    height: 74px;
    justify-content: space-around;
    left: 0;
    position: fixed;
    right: 0;
    z-index: 2;
  }

  .bottom-nav a {
    align-items: center;
    color: #8c9a9e;
    display: flex;
    flex: 1;
    flex-direction: column;
    font: 500 10px Poppins, sans-serif;
    gap: 4px;
    justify-content: center;
    text-decoration: none;
  }

  .bottom-nav ion-icon {
    font-size: 21px;
  }

  .bottom-nav .active {
    color: var(--agua-petroleo);
    font-weight: 700;
  }
}

@media (max-width: 560px) {
  .workspace {
    padding: 18px 14px;
  }

  .topbar {
    gap: 10px;
  }

  .period {
    display: none;
  }
}
</style>

