import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import LoginPage from '../views/LoginPage.vue';
import DashboardPage from '../views/DashboardPage.vue';
import CadastroPage from '../views/CadastroPage.vue';
import ForgotPasswordPage from '../views/ForgotPasswordPage.vue';
import ConsumptionPage from '../views/ConsumptionPage.vue';
import ConsumptionPeriodPage from '../views/ConsumptionPeriodPage.vue';
import GoalsPage from '../views/GoalsPage.vue';
import DevicesPage from '../views/DevicesPage.vue';
import DeviceDetailPage from '../views/DeviceDetailPage.vue';
import ReportsPage from '../views/ReportsPage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import SettingsPage from '../views/SettingsPage.vue';
import TermsPage from '../views/TermsPage.vue';
import { getUserProfile, isProfileComplete, waitForCurrentUser } from '../services/firebase.js';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/cadastro', name: 'Cadastro', component: CadastroPage },
  { path: '/termos', name: 'Termos', component: TermsPage },
  { path: '/esqueci-senha', name: 'EsqueciSenha', component: ForgotPasswordPage },
  { path: '/dashboard', name: 'Dashboard', component: DashboardPage },
  { path: '/consumo', name: 'Consumo', component: ConsumptionPage },
  {
    path: '/consumo/semana-passada',
    name: 'ConsumoSemanaPassada',
    component: ConsumptionPeriodPage,
    props: {
      periodLabel: 'Semana passada',
      chartTitle: 'Histórico da semana passada',
      chartBadge: 'Semana passada',
      days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
    },
  },
  {
    path: '/consumo/mês-passado',
    name: 'ConsumoMesPassado',
    component: ConsumptionPeriodPage,
    props: {
      periodLabel: 'Mês passado',
      chartTitle: 'Histórico do mês passado',
      chartBadge: 'Mês passado',
      days: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7'],
    },
  },
  { path: '/metas', name: 'Metas', component: GoalsPage },
  { path: '/dispositivos', name: 'Dispositivos', component: DevicesPage },
  { path: '/dispositivos/:id', name: 'DetalheDispositivo', component: DeviceDetailPage },
  { path: '/relatorios', name: 'Relatórios', component: ReportsPage },
  { path: '/perfil', name: 'Perfil', component: ProfilePage },
  { path: '/configurações', name: 'Configurações', component: SettingsPage },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

const publicRoutes = new Set(['/login', '/cadastro', '/termos', '/esqueci-senha']);

router.beforeEach(async (to) => {
  const user = await waitForCurrentUser();

  if (!user && !publicRoutes.has(to.path)) {
    return '/login';
  }

  if (user && (to.path === '/' || to.path === '/login')) {
    try {
      const profile = await getUserProfile(user.uid);
      return isProfileComplete(profile) ? '/dashboard' : '/cadastro?google=1';
    } catch (error) {
      return '/dashboard';
    }
  }

  return true;
});

export default router;
