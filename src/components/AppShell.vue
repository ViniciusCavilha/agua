<template>
  <main class="app-shell">
    <aside class="sidebar" aria-label="Navegação principal">
      <router-link class="brand" to="/dashboard" aria-label="Água+ dashboard">
        <span><ion-icon :icon="waterOutline" /></span>
        Agua<b>+</b>
      </router-link>

      <nav class="side-nav">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" :class="{ active: isActive(item.to) }">
          <ion-icon :icon="item.icon" />
          {{ item.label }}
        </router-link>
      </nav>

      <router-link class="settings" to="/configurações" :class="{ active: isActive('/configurações') }">
        <ion-icon :icon="settingsOutline" />
        Configurações
      </router-link>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div class="topbar-heading">
          <p>{{ displayedEyebrow }}</p>
          <h1>
            <span class="title-full">{{ title }}</span>
            <span class="title-mobile">{{ displayedMobileTitle }}</span>
          </h1>
        </div>
        <div v-if="showPeriod" class="period-menu">
          <button class="period" type="button" :aria-expanded="isPeriodMenuOpen" aria-haspopup="menu" @click="togglePeriodMenu">
            {{ periodLabel }}
            <ion-icon :icon="chevronDownOutline" />
          </button>
          <div v-if="isPeriodMenuOpen" class="period-card" role="menu">
            <router-link v-for="option in periodOptions" :key="option.to" :to="option.to" role="menuitem" @click="closePeriodMenu">
              <span>{{ option.label }}</span>
              <small>{{ option.detail }}</small>
            </router-link>
          </div>
        </div>
        <div class="notification-menu">
          <button
            class="icon-button"
            type="button"
            :aria-expanded="isNotificationsOpen"
            aria-haspopup="menu"
            aria-label="Notificações"
            @click="toggleNotifications"
          >
            <ion-icon :icon="notificationsOutline" />
            <i v-if="unreadCount" />
          </button>
          <div v-if="isNotificationsOpen" class="notification-card" role="menu">
            <div class="notification-head">
              <strong>Notificações</strong>
              <button v-if="unreadCount" type="button" @click="readAllNotifications">Marcar lidas</button>
            </div>
            <button
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{
                unread: !notification.read,
                success: notification.type === 'success',
                warning: notification.type === 'warning',
                critical: notification.type === 'critical',
              }"
              type="button"
              role="menuitem"
              @click="openNotification(notification)"
            >
              <span />
              <div>
                <strong>{{ notification.title }}</strong>
                <small>{{ notification.message }}</small>
              </div>
            </button>
            <p v-if="!notifications.length" class="empty-notifications">Nada novo por aqui.</p>
          </div>
        </div>
      </header>

      <slot />
    </section>

    <nav class="bottom-nav" aria-label="Navegação mobile">
      <router-link
        v-for="item in bottomNavItems"
        :key="item.to"
        :to="item.to"
        :class="{ active: isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        @click="closeFloatingMenus"
      >
        <ion-icon :icon="item.icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </router-link>
      <button
        type="button"
        :class="{ active: isMoreOpen || hasActiveMoreItem }"
        :aria-expanded="isMoreOpen"
        :aria-controls="moreSheetId"
        aria-haspopup="dialog"
        @click="openMore"
      >
        <ion-icon :icon="ellipsisHorizontal" aria-hidden="true" />
        <span>Mais</span>
      </button>
    </nav>

    <ion-modal
      :id="moreSheetId"
      class="mobile-more-modal"
      :is-open="isMoreOpen"
      :breakpoints="[0, 1]"
      :initial-breakpoint="1"
      :animated="!prefersReducedMotion"
      :html-attributes="{ 'aria-label': 'Mais opções de navegação' }"
      @didDismiss="closeMore"
    >
      <section class="more-sheet ion-content-scroll-host">
        <header class="more-sheet-header">
          <h2>Mais</h2>
          <button class="icon-button" type="button" aria-label="Fechar menu" @click="closeMore">
            <ion-icon :icon="closeOutline" aria-hidden="true" />
          </button>
        </header>
        <nav class="more-links" aria-label="Mais abas">
          <router-link
            v-for="item in moreNavItems"
            :key="item.to"
            :to="item.to"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            @click="closeMore"
          >
            <ion-icon :icon="item.icon" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </section>
    </ion-modal>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, useId, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonIcon, IonModal } from '@ionic/vue';
import {
  barChartOutline,
  chevronDownOutline,
  closeOutline,
  documentTextOutline,
  earthOutline,
  ellipsisHorizontal,
  hardwareChipOutline,
  homeOutline,
  notificationsOutline,
  personOutline,
  pieChartOutline,
  settingsOutline,
  waterOutline,
} from 'ionicons/icons';
import { getAccount, onAccountChange, saveAccount } from '../data/account-store.js';
import { resolveAccountTheme } from '../data/theme-store.js';
import { getCurrentUser, getUserProfile, watchAuthUser } from '../services/firebase.js';
import {
  getNotificationRoute,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  onNotificationsChange,
} from '../data/notifications-store.js';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  mobileTitle: {
    type: String,
    default: '',
  },
  eyebrow: {
    type: String,
    default: '',
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
const router = useRouter();
const isPeriodMenuOpen = ref(false);
const isNotificationsOpen = ref(false);
const isMoreOpen = ref(false);
const moreSheetId = `mobile-more-${useId()}`;
const prefersReducedMotion = ref(false);
const notifications = ref(getNotifications());
const account = ref(getAccount());
let stopNotificationsListener = null;
let stopAccountListener = null;
let stopAuthListener = null;
let mobileViewport;

const navItems = [
  { label: 'Início', to: '/dashboard', icon: homeOutline, mobilePrimary: true },
  { label: 'Consumo', to: '/consumo', icon: barChartOutline, mobilePrimary: true },
  { label: 'Metas', to: '/metas', icon: pieChartOutline },
  { label: 'Dispositivos', to: '/dispositivos', icon: hardwareChipOutline, mobilePrimary: true },
  { label: 'Relatórios', to: '/relatorios', icon: documentTextOutline },
  { label: 'Água e Sociedade', to: '/agua-e-sociedade', icon: earthOutline },
  { label: 'Perfil', to: '/perfil', icon: personOutline },
];

const bottomNavItems = navItems.filter((item) => item.mobilePrimary);
const moreNavItems = [
  ...navItems.filter((item) => !item.mobilePrimary),
  { label: 'Configurações', to: '/configurações', icon: settingsOutline },
];

const periodOptions = [
  { label: 'Esta semana', detail: 'Resumo da semana atual', to: '/consumo' },
  { label: 'Semana passada', detail: 'Resumo dos últimos 7 dias fechados', to: '/consumo/semana-passada' },
  { label: 'Mês passado', detail: 'Resumo do ciclo mensal anterior', to: '/consumo/mês-passado' },
];

const firstName = computed(() => String(account.value.name || '').trim().split(/\s+/).filter(Boolean)[0] || '');
const displayedEyebrow = computed(() => props.eyebrow || (firstName.value ? `Olá, ${firstName.value}` : 'Olá'));
const displayedMobileTitle = computed(() => props.mobileTitle || props.title);

const refreshAccountName = async (user = getCurrentUser()) => {
  if (!user) {
    account.value = getAccount();
    return;
  }

  try {
    const remoteProfile = await getUserProfile(user.uid);
    const localAccount = getAccount({ uid: user.uid, email: user.email });
    const hasMatchingLocalAccount = Boolean(localAccount.uid && localAccount.uid === user.uid);
    const resolvedTheme = resolveAccountTheme({
      remoteTheme: remoteProfile?.theme,
      themeConfigured: remoteProfile?.themeConfigured,
      localTheme: hasMatchingLocalAccount ? localAccount.theme : '',
    });
    account.value = saveAccount({
      ...(hasMatchingLocalAccount ? localAccount : {}),
      ...(remoteProfile || {}),
      uid: user.uid,
      email: user.email || remoteProfile?.email || '',
      name: remoteProfile?.name || user.displayName || '',
      avatarImage: remoteProfile?.avatarImage || user.photoURL || '',
      theme: resolvedTheme || 'light',
    });
  } catch (error) {
    account.value = {
      ...getAccount({ uid: user.uid, email: user.email }),
      name: getAccount({ uid: user.uid, email: user.email }).name || user.displayName || '',
    };
  }
};
const togglePeriodMenu = () => {
  isPeriodMenuOpen.value = !isPeriodMenuOpen.value;
};

const closePeriodMenu = () => {
  isPeriodMenuOpen.value = false;
};

const unreadCount = computed(() => notifications.value.filter((notification) => !notification.read).length);

const refreshNotifications = () => {
  notifications.value = getNotifications();
};

const toggleNotifications = () => {
  closeMore();
  closePeriodMenu();
  isNotificationsOpen.value = !isNotificationsOpen.value;
};

const openMore = () => {
  isNotificationsOpen.value = false;
  closePeriodMenu();
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  isMoreOpen.value = true;
};

const closeMore = () => {
  isMoreOpen.value = false;
};

const closeMoreOnDesktop = (event) => {
  if (!event.matches) {
    closeMore();
  }
};

const openNotification = (notification) => {
  notifications.value = markNotificationRead(notification.id);
  isNotificationsOpen.value = false;
  closeMore();
  router.push(getNotificationRoute(notification));
};

const readAllNotifications = () => {
  notifications.value = markAllNotificationsRead();
};

const closeFloatingMenus = () => {
  closePeriodMenu();
  isNotificationsOpen.value = false;
  closeMore();
};

const handleEscapeKey = (event) => {
  if (event.key === 'Escape') {
    closeFloatingMenus();
  }
};

const isActive = (path) => {
  if (path === '/consumo' || path === '/dispositivos') {
    return route.path.startsWith(path);
  }

  return route.path === path;
};

const hasActiveMoreItem = computed(() => moreNavItems.some((item) => isActive(item.to)));

onMounted(() => {
  mobileViewport = window.matchMedia('(max-width: 980px)');
  mobileViewport.addEventListener('change', closeMoreOnDesktop);
  window.addEventListener('keydown', handleEscapeKey);
  stopNotificationsListener = onNotificationsChange(refreshNotifications);
  stopAccountListener = onAccountChange((nextAccount) => {
    account.value = nextAccount;
  });
  refreshAccountName();
  stopAuthListener = watchAuthUser((user) => {
    refreshAccountName(user);
  });
});

onUnmounted(() => {
  mobileViewport?.removeEventListener('change', closeMoreOnDesktop);
  window.removeEventListener('keydown', handleEscapeKey);
  stopNotificationsListener?.();
  stopAccountListener?.();
  stopAuthListener?.();
});

watch(
  () => route.fullPath,
  closeFloatingMenus,
);
</script>

<style scoped>
.app-shell {
  background: var(--agua-claro);
  color: var(--agua-texto);
  font-family: Poppins, sans-serif;
  min-height: 100%;
  overflow-x: clip;
  padding-left: 248px;
}

.sidebar {
  background: linear-gradient(180deg, #08242c, #0a323b);
  color: var(--agua-branco);
  display: flex;
  flex-direction: column;
  bottom: 0;
  left: 0;
  min-height: 100vh;
  padding: 28px 18px;
  position: fixed;
  top: 0;
  overflow-y: auto;
  width: 248px;
  z-index: 4;
}

.brand {
  align-items: center;
  color: #7de2d9;
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
  color: rgba(255, 255, 255, 0.82);
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
.settings.active,
.settings:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.side-nav ion-icon,
.settings ion-icon {
  font-size: 19px;
}

.settings {
  margin-top: 6px;
}

.workspace {
  margin: 0 auto;
  max-width: 1180px;
  padding: 28px clamp(18px, 4vw, 44px) 34px;
  width: 100%;
  min-width: 0;
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

.title-mobile {
  display: none;
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

.period-menu,
.notification-menu {
  position: relative;
}

.period-card,
.notification-card {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 16px;
  box-shadow: var(--agua-shadow);
  display: grid;
  gap: 4px;
  min-width: 230px;
  padding: 8px;
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: 5;
}

.notification-card {
  gap: 8px;
  max-height: min(70vh, 520px);
  min-width: 310px;
  overflow-y: auto;
}

.notification-head {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding: 6px 8px 2px;
}

.notification-head strong {
  color: var(--agua-petroleo);
  font-size: 13px;
}

.notification-head button {
  background: transparent;
  border: 0;
  color: var(--agua-agua);
  cursor: pointer;
  font: 700 11px Poppins, sans-serif;
  padding: 0;
}

.period-card a {
  border-radius: 12px;
  color: var(--agua-petroleo);
  display: grid;
  gap: 3px;
  padding: 11px 12px;
  text-decoration: none;
}

.period-card a:hover,
.period-card a.router-link-active {
  background: #f0fbfa;
}

.period-card span {
  font-size: 13px;
  font-weight: 700;
}

.period-card small {
  color: var(--agua-suave);
  font-size: 11px;
  line-height: 1.35;
}

.notification-item {
  align-items: start;
  background: transparent;
  border: 0;
  border-radius: 12px;
  color: var(--agua-texto);
  cursor: pointer;
  display: grid;
  gap: 10px;
  grid-template-columns: auto 1fr;
  padding: 11px 12px;
  text-align: left;
  width: 100%;
}

.notification-item:hover,
.notification-item.unread {
  background: #f0fbfa;
}

.notification-item > span {
  background: var(--agua-erro);
  border-radius: 999px;
  height: 10px;
  margin-top: 4px;
  width: 10px;
}

.notification-item.success > span {
  background: var(--agua-sucesso);
}

.notification-item.warning > span {
  background: var(--agua-alerta);
}

.notification-item.critical > span {
  background: var(--agua-erro);
}

.notification-item:not(.unread) > span {
  opacity: 0.28;
}

.notification-item strong {
  color: var(--agua-petroleo);
  display: block;
  font-size: 12px;
  margin-bottom: 3px;
}

.notification-item small,
.empty-notifications {
  color: var(--agua-suave);
  font-size: 11px;
  line-height: 1.45;
}

.empty-notifications {
  margin: 0;
  padding: 10px 12px;
}

.bottom-nav {
  display: none;
}

.mobile-more-modal {
  --background: var(--agua-branco);
  --border-color: var(--agua-borda);
  --border-radius: 8px 8px 0 0;
  --border-style: solid;
  --border-width: 1px 1px 0;
  --height: min(calc(352px + env(safe-area-inset-bottom)), 90vh);
  --height: min(calc(352px + env(safe-area-inset-bottom)), 90dvh);
  --max-width: 520px;
}

.mobile-more-modal::part(content) {
  box-sizing: border-box;
}

.more-sheet {
  color: var(--agua-texto);
  font-family: Poppins, sans-serif;
  height: 100%;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  padding: 16px max(16px, env(safe-area-inset-right))
    calc(12px + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
}

.more-sheet-header {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 4px;
}

.more-sheet-header h2 {
  color: var(--agua-petroleo);
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.more-sheet-header .icon-button {
  border-radius: 8px;
}

.more-links {
  display: grid;
  gap: 4px;
}

.more-links a {
  align-items: center;
  border-radius: 8px;
  color: var(--agua-texto);
  display: grid;
  font-size: 14px;
  font-weight: 600;
  gap: 12px;
  grid-template-columns: 22px minmax(0, 1fr);
  min-height: 48px;
  overflow-wrap: anywhere;
  padding: 6px 10px;
  text-decoration: none;
}

.more-links a:hover,
.more-links a[aria-current='page'] {
  background: var(--agua-muted);
  color: var(--agua-petroleo);
}

.more-links ion-icon {
  font-size: 20px;
}

@media (max-width: 980px) {
  .app-shell {
    --mobile-nav-height: 64px;
    display: block;
    padding-bottom: calc(var(--mobile-nav-height) + env(safe-area-inset-bottom));
    padding-left: 0;
  }

  .sidebar {
    display: none;
  }

  .workspace {
    padding: calc(22px + env(safe-area-inset-top)) max(18px, env(safe-area-inset-right))
      22px max(18px, env(safe-area-inset-left));
  }

  .topbar {
    align-items: start;
    grid-template-columns: minmax(0, 1fr) 44px;
    position: relative;
    z-index: 7;
  }

  .topbar-heading {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
  }

  .title-full {
    display: none;
  }

  .title-mobile {
    display: inline;
  }

  .period-menu {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: start;
  }

  .period-card {
    left: 0;
    right: auto;
  }

  .notification-menu {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
  }

  .bottom-nav {
    align-items: stretch;
    background: var(--agua-branco);
    border-top: 1px solid var(--agua-borda);
    bottom: 0;
    box-shadow: 0 -4px 18px rgba(8, 25, 31, 0.08);
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: minmax(0, 1fr);
    height: calc(var(--mobile-nav-height) + env(safe-area-inset-bottom));
    left: 0;
    padding: 4px max(4px, env(safe-area-inset-right), calc((100% - 600px) / 2))
      calc(4px + env(safe-area-inset-bottom)) max(4px, env(safe-area-inset-left), calc((100% - 600px) / 2));
    position: fixed;
    right: 0;
    z-index: 8;
  }

  .bottom-nav a,
  .bottom-nav button {
    align-content: center;
    background: transparent;
    border: 0;
    border-radius: 8px;
    color: var(--agua-texto);
    cursor: pointer;
    display: grid;
    font: 600 11px/1.2 Poppins, sans-serif;
    gap: 4px;
    justify-items: center;
    min-height: 44px;
    min-width: 0;
    overflow-wrap: anywhere;
    padding: 2px 0;
    text-align: center;
    text-decoration: none;
  }

  .bottom-nav ion-icon {
    font-size: 22px;
  }

  .bottom-nav .active {
    background: var(--agua-muted);
    background: color-mix(in srgb, var(--agua-agua) 12%, var(--agua-branco));
    color: var(--agua-petroleo);
    font-weight: 700;
  }
}

@media (max-width: 560px) {
  .workspace {
    padding: calc(18px + env(safe-area-inset-top)) max(14px, env(safe-area-inset-right))
      18px max(14px, env(safe-area-inset-left));
  }

  .topbar {
    gap: 10px;
  }

  .notification-card {
    min-width: min(300px, calc(100vw - 28px));
  }
}

</style>



