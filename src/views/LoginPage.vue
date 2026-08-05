<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <main class="login-page">
        <section class="login-panel" aria-label="Acesso ao Agua+">
          <router-link class="brand" to="/login" aria-label="Agua+ inicio">
            <span><ion-icon :icon="waterOutline" /></span>
            Agua<b>+</b>
          </router-link>

          <div class="intro">
            <span class="badge">
              <ion-icon :icon="shieldCheckmarkOutline" />
              Plataforma segura
            </span>
            <h1>Entre para acompanhar o consumo em tempo real.</h1>
            <p>Monitore indicadores, metas e economia de agua em uma visao clara para sua operacao.</p>
          </div>

          <form @submit.prevent="login">
            <label>
              E-mail
              <input v-model="email" type="email" autocomplete="email" placeholder="seuemail@instituicao.com" />
            </label>

            <label>
              Senha
              <span class="password">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Digite sua senha"
                />
                <button type="button" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" @click="showPassword = !showPassword">
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                </button>
              </span>
            </label>

            <div class="options">
              <label class="remember">
                <input v-model="remember" type="checkbox" />
                <span>Lembrar acesso</span>
              </label>
              <router-link to="/esqueci-senha">Esqueci minha senha</router-link>
            </div>

            <PrimaryButton>
              {{ loading ? 'Entrando...' : 'Entrar' }}
              <ion-icon :icon="arrowForwardOutline" />
            </PrimaryButton>
          </form>

          <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

          <div class="divider"><span />ou continue com<span /></div>

          <div class="social">
            <SecondaryButton :disabled="loading" @click="googleLogin"><ion-icon :icon="logoGoogle" /> Google</SecondaryButton>
            <SecondaryButton disabled><ion-icon :icon="logoApple" /> Apple</SecondaryButton>
          </div>

          <p class="signup">Nao tem uma conta? <router-link to="/cadastro">Cadastre-se</router-link></p>
        </section>

        <aside class="brand-panel" aria-label="Resumo Agua+">
          <div class="panel-inner">
            <div class="drop"><ion-icon :icon="waterOutline" /></div>
            <h2>Cada gota vira decisao.</h2>
            <p>O Agua+ transforma leitura de consumo em metas simples, alertas uteis e economia mensuravel.</p>

            <div class="preview-card">
              <span class="preview-icon"><ion-icon :icon="leafOutline" /></span>
              <div>
                <small>Economia no mes</small>
                <strong>18.420 L</strong>
              </div>
              <em>-12%</em>
            </div>
          </div>
        </aside>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  arrowForwardOutline,
  eyeOffOutline,
  eyeOutline,
  leafOutline,
  logoApple,
  logoGoogle,
  shieldCheckmarkOutline,
  waterOutline,
} from 'ionicons/icons';
import PrimaryButton from '../components/PrimaryButton.vue';
import SecondaryButton from '../components/SecondaryButton.vue';
import { isFirebaseReady, loginWithEmail, loginWithGoogle } from '../services/firebase.js';
import { saveAccount } from '../data/account-store.js';

const router = useRouter();
const email = ref('');
const password = ref('');
const remember = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const finishLogin = (account) => {
  if (account) {
    saveAccount(account);
  }

  router.push('/dashboard');
};

const getAuthMessage = (error) => {
  const code = error?.code || '';

  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'E-mail ou senha incorretos.';
  }

  if (code.includes('popup-closed-by-user')) {
    return 'Login com Google cancelado.';
  }

  return error?.message || 'Nao foi possivel entrar agora.';
};

const login = async () => {
  errorMessage.value = '';

  if (!isFirebaseReady()) {
    finishLogin();
    return;
  }

  try {
    loading.value = true;
    const account = await loginWithEmail(email.value, password.value);
    finishLogin(account);
  } catch (error) {
    errorMessage.value = getAuthMessage(error);
  } finally {
    loading.value = false;
  }
};

const googleLogin = async () => {
  errorMessage.value = '';

  try {
    loading.value = true;
    const { account, profileComplete } = await loginWithGoogle();
    saveAccount(account);

    if (!profileComplete) {
      router.push('/cadastro?google=1');
      return;
    }

    finishLogin(account);
  } catch (error) {
    errorMessage.value = getAuthMessage(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  --auth-petroleo: #0d4b5e;
  --auth-agua: #1ca7a0;
  --auth-bg: #ffffff;
  --auth-texto: #16343d;
  --auth-suave: #718087;
  --auth-borda: #d8e1e3;
  --auth-panel: #ffffff;
  --auth-page-bg: linear-gradient(120deg, #ffffff, #f7fbfb 48%, #eaf4f4);
  --auth-shadow: 0 20px 60px rgba(13, 75, 94, 0.1);
  background:
    radial-gradient(circle at 10% 10%, rgba(28, 167, 160, 0.1), transparent 28%),
    var(--auth-page-bg);
  color: var(--auth-texto);
  display: grid;
  font-family: Poppins, sans-serif;
  grid-template-columns: minmax(420px, 1fr) minmax(390px, 0.85fr);
  color-scheme: light;
  min-height: 100%;
}

.login-panel {
  align-self: center;
  justify-self: center;
  padding: 52px 28px;
  width: min(100%, 500px);
}

.brand {
  align-items: center;
  color: var(--auth-petroleo);
  display: inline-flex;
  font-size: 28px;
  font-weight: 700;
  gap: 9px;
  letter-spacing: 0;
  text-decoration: none;
}

.brand span {
  background: var(--auth-petroleo);
  border-radius: 14px;
  color: var(--auth-bg);
  display: grid;
  height: 44px;
  place-items: center;
  width: 44px;
}

.brand b {
  color: var(--auth-agua);
}

.intro {
  margin: 44px 0 30px;
}

.badge {
  align-items: center;
  background: rgba(28, 167, 160, 0.1);
  border: 1px solid rgba(28, 167, 160, 0.18);
  border-radius: 999px;
  color: #137d78;
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  gap: 7px;
  margin-bottom: 18px;
  padding: 8px 12px;
}

.intro h1 {
  color: var(--auth-petroleo);
  font-size: clamp(29px, 5vw, 44px);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.08;
  margin: 0 0 14px;
}

.intro p {
  color: var(--auth-suave);
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  max-width: 430px;
}

form {
  display: grid;
  gap: 17px;
}

form > label {
  color: var(--auth-texto);
  display: grid;
  font-size: 12px;
  font-weight: 600;
  gap: 8px;
}

input {
  background: var(--auth-bg);
  color-scheme: light;
  border: 1px solid var(--auth-borda);
  border-radius: 14px;
  color: var(--auth-texto);
  font: 400 14px Poppins, sans-serif;
  height: 52px;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
  width: 100%;
}

input:focus {
  border-color: var(--auth-agua);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.14);
}

.password {
  display: block;
  position: relative;
}

.password input {
  padding-right: 50px;
}

.password button {
  background: transparent;
  border: 0;
  color: var(--auth-suave);
  cursor: pointer;
  font-size: 20px;
  height: 52px;
  position: absolute;
  right: 0;
  top: 0;
  width: 50px;
}

.options {
  align-items: center;
  display: flex;
  font-size: 12px;
  justify-content: space-between;
  margin-top: -2px;
}

.remember {
  align-items: center;
  color: var(--auth-suave) !important;
  display: inline-flex !important;
  font-weight: 500 !important;
  gap: 7px;
}

.remember input {
  accent-color: var(--auth-petroleo);
  height: 15px;
  width: 15px;
}

.options a,
.signup a {
  color: var(--auth-petroleo);
  font-weight: 700;
  text-decoration: none;
}

.divider {
  align-items: center;
  color: #8a9a9f;
  display: flex;
  font-size: 12px;
  gap: 12px;
  margin: 25px 0 17px;
}

.auth-error {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 14px;
  color: #be123c;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  margin: 14px 0 0;
  padding: 12px 14px;
}

.divider span {
  background: #e4eaeb;
  flex: 1;
  height: 1px;
}

.social {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}

.signup {
  color: var(--auth-suave);
  font-size: 12px;
  margin: 26px 0 0;
  text-align: center;
}

.brand-panel {
  background:
    linear-gradient(145deg, rgba(28, 167, 160, 0.18), transparent 38%),
    var(--auth-petroleo);
  color: var(--auth-bg);
  display: grid;
  overflow: hidden;
  padding: 42px;
  place-items: center;
  position: relative;
}

.brand-panel::before,
.brand-panel::after {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
  content: '';
  position: absolute;
}

.brand-panel::before {
  height: 430px;
  right: -190px;
  top: -155px;
  width: 430px;
}

.brand-panel::after {
  bottom: -155px;
  height: 330px;
  left: -185px;
  width: 330px;
}

.panel-inner {
  max-width: 360px;
  position: relative;
  z-index: 1;
}

.drop {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  color: #7de2d9;
  display: grid;
  font-size: 48px;
  height: 88px;
  place-items: center;
  width: 88px;
}

.panel-inner h2 {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.08;
  margin: 32px 0 13px;
}

.panel-inner > p {
  color: #d3e5e8;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.preview-card {
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  display: grid;
  gap: 12px;
  grid-template-columns: auto 1fr auto;
  margin-top: 36px;
  padding: 16px;
}

.preview-icon {
  background: rgba(34, 197, 94, 0.16);
  border-radius: 14px;
  color: #70e1a2;
  display: grid;
  font-size: 24px;
  height: 46px;
  place-items: center;
  width: 46px;
}

.preview-card small,
.preview-card strong {
  display: block;
}

.preview-card small {
  color: #c9dfe2;
  font-size: 11px;
}

.preview-card strong {
  color: var(--auth-bg);
  font-size: 20px;
  line-height: 1.2;
}

.preview-card em {
  color: #70e1a2;
  font-size: 13px;
  font-style: normal;
  font-weight: 700;
}

@media (max-width: 820px) {
  .login-page {
  --auth-petroleo: #0d4b5e;
  --auth-agua: #1ca7a0;
  --auth-bg: #ffffff;
  --auth-texto: #16343d;
  --auth-suave: #718087;
  --auth-borda: #d8e1e3;
  --auth-panel: #ffffff;
  --auth-page-bg: linear-gradient(120deg, #ffffff, #f7fbfb 48%, #eaf4f4);
  --auth-shadow: 0 20px 60px rgba(13, 75, 94, 0.1);
    display: block;
  }

  .login-panel {
    padding: 34px 22px;
  }

  .brand-panel {
    display: none;
  }

  .intro {
    margin: 36px 0 26px;
  }
}

@media (max-width: 420px) {
  .social {
    grid-template-columns: 1fr;
  }

  .options {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}
</style>




