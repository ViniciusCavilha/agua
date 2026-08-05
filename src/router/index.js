import { createRouter, createWebHistory } from '@ionic/vue-router';
import LoginPage from '../views/LoginPage.vue';
import DashboardPage from '../views/DashboardPage.vue';
import CadastroPage from '../views/CadastroPage.vue';
import ForgotPasswordPage from '../views/ForgotPasswordPage.vue';
import ConsumptionPage from '../views/ConsumptionPage.vue';
import GoalsPage from '../views/GoalsPage.vue';
import ProfilePage from '../views/ProfilePage.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/cadastro', name: 'Cadastro', component: CadastroPage },
  { path: '/esqueci-senha', name: 'EsqueciSenha', component: ForgotPasswordPage },
  { path: '/dashboard', name: 'Dashboard', component: DashboardPage },
  { path: '/consumo', name: 'Consumo', component: ConsumptionPage },
  { path: '/metas', name: 'Metas', component: GoalsPage },
  { path: '/perfil', name: 'Perfil', component: ProfilePage },
];

const baseUrl = process.env.BASE_URL || '/';

export default createRouter({
  history: createWebHistory(baseUrl),
  routes,
});
