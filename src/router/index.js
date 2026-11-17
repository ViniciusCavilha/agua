import { createRouter, createWebHashHistory } from '@ionic/vue-router';
import { getUserProfile, isProfileComplete, waitForCurrentUser } from '../services/firebase.js';

const LoginPage = () => import('../views/LoginPage.vue');
const DashboardPage = () => import('../views/DashboardPage.vue');
const CadastroPage = () => import('../views/CadastroPage.vue');
const ForgotPasswordPage = () => import('../views/ForgotPasswordPage.vue');
const ConsumptionPage = () => import('../views/ConsumptionPage.vue');
const ConsumptionPeriodPage = () => import('../views/ConsumptionPeriodPage.vue');
const GoalsPage = () => import('../views/GoalsPage.vue');
const DevicesPage = () => import('../views/DevicesPage.vue');
const DeviceDetailPage = () => import('../views/DeviceDetailPage.vue');
const ReportsPage = () => import('../views/ReportsPage.vue');
const ProfilePage = () => import('../views/ProfilePage.vue');
const SettingsPage = () => import('../views/SettingsPage.vue');
const WaterSocietyPage = () => import('../views/WaterSocietyPage.vue');
const TermsPage = () => import('../views/TermsPage.vue');

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
  { path: '/agua-e-sociedade', name: 'AguaESociedade', component: WaterSocietyPage },
  { path: '/sustentabilidade', redirect: '/agua-e-sociedade' },
  { path: '/historia-da-agua', redirect: '/agua-e-sociedade' },
  { path: '/perfil', name: 'Perfil', component: ProfilePage },
  { path: '/configurações', name: 'Configurações', component: SettingsPage },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
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
