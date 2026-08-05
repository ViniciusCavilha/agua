<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <main class="auth-page">
        <section class="auth-panel" aria-label="Cadastro Agua+">
          <router-link class="brand" to="/login" aria-label="Voltar para login">
            <span><ion-icon :icon="waterOutline" /></span>
            Agua<b>+</b>
          </router-link>

          <div class="intro">
            <span class="badge">
              <ion-icon :icon="personAddOutline" />
              Novo acesso
            </span>
            <h1>Crie sua conta para comecar a monitorar.</h1>
            <p>Cadastre sua instituicao e acompanhe consumo, metas e economia em um painel simples.</p>
          </div>

          <form @submit.prevent="createAccount">
            <div class="field-grid">
              <label>
                Nome completo
                <span class="input-shell">
                  <ion-icon :icon="personOutline" />
                  <input :value="name" type="text" autocomplete="name" placeholder="Seu nome" required @input="updateName" />
                </span>
              </label>

              <label>
                Telefone
                <span class="input-shell">
                  <ion-icon :icon="callOutline" />
                  <input
                    :value="phone"
                    type="tel"
                    autocomplete="tel"
                    inputmode="numeric"
                    maxlength="15"
                    placeholder="(00) 00000-0000"
                    required
                    @input="updatePhone"
                  />
                </span>
              </label>
            </div>

            <label>
              E-mail corporativo
              <span class="input-shell">
                <ion-icon :icon="mailOutline" />
                <input v-model="email" type="email" autocomplete="email" placeholder="seuemail@instituicao.com" required />
              </span>
            </label>

            <div class="field-grid">
              <label>
                Instituicao
                <span class="input-shell">
                  <ion-icon :icon="businessOutline" />
                  <input
                    :value="company"
                    type="text"
                    autocomplete="organization"
                    placeholder="Ex: Senac"
                    required
                    @input="updateCompany"
                  />
                </span>
              </label>
              <UnitPicker v-if="unitOptions.length" v-model="unit" :options="unitOptions" locked-light />
            </div>

            <div class="field-grid">
              <label v-if="!isGoogleRegistration">
                Senha
                <span class="input-shell password">
                  <ion-icon :icon="lockClosedOutline" />
                  <input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Min. 8 caracteres" required />
                  <button type="button" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" @click="showPassword = !showPassword">
                    <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" />
                  </button>
                </span>
              </label>

              <label v-if="!isGoogleRegistration">
                Confirmar senha
                <span class="input-shell password">
                  <ion-icon :icon="lockClosedOutline" />
                  <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Repita a senha" required />
                </span>
              </label>
            </div>

            <label class="terms">
              <input v-model="acceptedTerms" type="checkbox" required />
              <span>Aceito os termos de uso e a politica de privacidade.</span>
            </label>

            <PrimaryButton :disabled="!canSubmit">
              {{ loading ? 'Criando conta...' : 'Criar conta' }}
              <ion-icon :icon="arrowForwardOutline" />
            </PrimaryButton>
          </form>

          <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

          <div class="divider"><span />ou cadastre com<span /></div>

          <SecondaryButton :disabled="loading" @click="googleSignup">
            <ion-icon :icon="logoGoogle" />
            Google
          </SecondaryButton>

          <p class="switch-auth">Ja tem uma conta? <router-link to="/login">Entrar</router-link></p>
        </section>

        <aside class="info-panel" aria-label="Beneficios Agua+">
          <div class="info-content">
            <div class="drop"><ion-icon :icon="waterOutline" /></div>
            <h2>Seu consumo, finalmente visivel.</h2>
            <p>Organize leituras, acompanhe metas e entregue indicadores claros para a equipe.</p>

            <div class="benefits">
              <div><ion-icon :icon="checkmarkCircleOutline" /> Alertas de consumo fora do padrao</div>
              <div><ion-icon :icon="checkmarkCircleOutline" /> Resumo mensal com impacto financeiro</div>
              <div><ion-icon :icon="checkmarkCircleOutline" /> Metas de economia por unidade</div>
            </div>
          </div>
        </aside>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  arrowForwardOutline,
  businessOutline,
  callOutline,
  checkmarkCircleOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  logoGoogle,
  mailOutline,
  personAddOutline,
  personOutline,
  waterOutline,
} from 'ionicons/icons';
import PrimaryButton from '../components/PrimaryButton.vue';
import SecondaryButton from '../components/SecondaryButton.vue';
import UnitPicker from '../components/UnitPicker.vue';
import { getAvailableUnits, saveAccount } from '../data/account-store.js';
import { createFirebaseAccount, getCurrentUser, isFirebaseReady, loginWithGoogle } from '../services/firebase.js';

const router = useRouter();
const route = useRoute();
const name = ref('');
const phone = ref('');
const email = ref('');
const company = ref('');
const unit = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptedTerms = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const googleAvatarImage = ref('');
const isGoogleRegistration = ref(false);

const formatPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const unitOptions = computed(() => getAvailableUnits(company.value));

watch(unitOptions, (options) => {
  if (options.length && !options.includes(unit.value)) {
    unit.value = '';
  }
});

const canSubmit = computed(() => {
  return Boolean(
    name.value &&
    phone.value &&
    email.value &&
    company.value &&
    (!unitOptions.value.length || unit.value) &&
    (isGoogleRegistration.value || (password.value.length >= 8 && password.value === confirmPassword.value)) &&
    acceptedTerms.value,
  );
});

const updatePhone = (event) => {
  phone.value = formatPhone(event.target.value);
};

const capitalizeWords = (value) => {
  return String(value || '').replace(/(^|\s)(\S)/g, (match, space, letter) => `${space}${letter.toUpperCase()}`);
};

const updateName = (event) => {
  name.value = capitalizeWords(event.target.value);
};

const capitalizeFirstLetter = (value) => {
  const text = String(value || '');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
};

const updateCompany = (event) => {
  company.value = capitalizeFirstLetter(event.target.value);
};

const getAuthMessage = (error) => {
  const code = error?.code || '';

  if (code.includes('email-already-in-use')) {
    return 'Esse e-mail ja esta cadastrado.';
  }

  if (code.includes('weak-password')) {
    return 'Use uma senha mais forte, com pelo menos 8 caracteres.';
  }

  return error?.message || 'Nao foi possivel criar a conta agora.';
};

const createAccount = async () => {
  if (!canSubmit.value) {
    return;
  }

  errorMessage.value = '';
  const account = {
    name: name.value,
    phone: formatPhone(phone.value),
    email: email.value,
    company: company.value,
    unit: unitOptions.value.length ? unit.value : '',
  };

  try {
    loading.value = true;

    if (isFirebaseReady()) {
      const firebaseAccount = await createFirebaseAccount({
        ...account,
        password: password.value,
        avatarImage: googleAvatarImage.value,
      });
      saveAccount(firebaseAccount);
    } else {
      saveAccount(account);
    }

    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = getAuthMessage(error);
  } finally {
    loading.value = false;
  }
};

const googleSignup = async () => {
  errorMessage.value = '';

  try {
    loading.value = true;
    const { account, profileComplete } = await loginWithGoogle();
    saveAccount(account);

    if (profileComplete) {
      router.push('/dashboard');
      return;
    }

    name.value = account.name;
    email.value = account.email;
    phone.value = formatPhone(account.phone);
    googleAvatarImage.value = account.avatarImage || '';
    isGoogleRegistration.value = true;
  } catch (error) {
    errorMessage.value = getAuthMessage(error);
  } finally {
    loading.value = false;
  }
};

const fillGoogleRegistration = () => {
  const currentUser = getCurrentUser();

  if (!currentUser || route.query.google !== '1') {
    return;
  }

  name.value = currentUser.displayName || name.value;
  email.value = currentUser.email || email.value;
  googleAvatarImage.value = currentUser.photoURL || '';
  isGoogleRegistration.value = true;
};

fillGoogleRegistration();
</script>

<style scoped>
.auth-page {
  --auth-petroleo: #0d4b5e;
  --auth-agua: #1ca7a0;
  --auth-bg: #ffffff;
  --auth-texto: #16343d;
  --auth-suave: #718087;
  --auth-borda: #d8e1e3;
  --auth-page-bg: linear-gradient(120deg, #ffffff, #f7fbfb 48%, #eaf4f4);
  --auth-shadow: 0 20px 60px rgba(13, 75, 94, 0.1);
  background:
    radial-gradient(circle at 12% 10%, rgba(28, 167, 160, 0.11), transparent 28%),
    var(--auth-page-bg);
  color: var(--auth-texto);
  display: grid;
  font-family: Poppins, sans-serif;
  grid-template-columns: minmax(520px, 1fr) minmax(360px, 0.72fr);
  color-scheme: light;
  min-height: 100%;
}

.auth-panel {
  align-self: center;
  justify-self: center;
  padding: 42px 28px;
  width: min(100%, 650px);
}

.brand {
  align-items: center;
  color: var(--auth-petroleo);
  display: inline-flex;
  font-size: 28px;
  font-weight: 700;
  gap: 9px;
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
  margin: 34px 0 26px;
}

.badge {
  align-items: center;
  background: rgba(28, 167, 160, 0.1);
  border: 1px solid rgba(28, 167, 160, 0.18);
  border-radius: 999px;
  color: #137d78;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  gap: 7px;
  margin-bottom: 16px;
  padding: 8px 12px;
}

.intro h1 {
  color: var(--auth-petroleo);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.09;
  margin: 0 0 12px;
  max-width: 580px;
}

.intro p {
  color: var(--auth-suave);
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
  max-width: 500px;
}

form {
  display: grid;
  gap: 16px;
}

.field-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr 1fr;
}

label {
  color: var(--auth-texto);
  display: grid;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
}

.input-shell {
  align-items: center;
  background: var(--auth-bg);
  border: 1px solid var(--auth-borda);
  border-radius: 14px;
  display: grid;
  gap: 10px;
  grid-template-columns: auto 1fr;
  min-height: 52px;
  padding: 0 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.input-shell:focus-within {
  border-color: var(--auth-agua);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.14);
}

.input-shell > ion-icon {
  color: var(--auth-suave);
  font-size: 18px;
}

input,
select {
  background: transparent;
  color-scheme: light;
  border: 0;
  color: var(--auth-texto);
  font: 400 14px Poppins, sans-serif;
  min-width: 0;
  outline: none;
  width: 100%;
}

select {
  cursor: pointer;
}

.password {
  grid-template-columns: auto 1fr auto;
}

.password button {
  background: transparent;
  border: 0;
  color: var(--auth-suave);
  cursor: pointer;
  display: grid;
  font-size: 20px;
  place-items: center;
}

.terms {
  align-items: flex-start;
  color: var(--auth-suave);
  display: flex;
  font-weight: 500;
  gap: 9px;
  line-height: 1.5;
}

.terms input {
  accent-color: var(--auth-petroleo);
  flex: 0 0 auto;
  height: 16px;
  margin-top: 2px;
  width: 16px;
}

.switch-auth {
  color: var(--auth-suave);
  font-size: 12px;
  margin: 24px 0 0;
  text-align: center;
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

.divider {
  align-items: center;
  color: #8a9a9f;
  display: flex;
  font-size: 12px;
  gap: 12px;
  margin: 22px 0 14px;
}

.divider span {
  background: #e4eaeb;
  flex: 1;
  height: 1px;
}

.switch-auth a {
  color: var(--auth-petroleo);
  font-weight: 700;
  text-decoration: none;
}

.info-panel {
  background:
    linear-gradient(145deg, rgba(28, 167, 160, 0.18), transparent 38%),
    #0d4b5e;
  color: #ffffff;
  display: grid;
  overflow: hidden;
  padding: 42px;
  place-items: center;
  position: relative;
}

.info-panel::before,
.info-panel::after {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
  content: '';
  position: absolute;
}

.info-panel::before {
  height: 430px;
  right: -190px;
  top: -155px;
  width: 430px;
}

.info-panel::after {
  bottom: -155px;
  height: 330px;
  left: -185px;
  width: 330px;
}

.info-content {
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

.info-content h2 {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.08;
  margin: 32px 0 13px;
}

.info-content p {
  color: #d3e5e8;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.benefits {
  display: grid;
  gap: 12px;
  margin-top: 34px;
}

.benefits div {
  align-items: center;
  background: rgba(255, 255, 255, 0.11);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  color: #e6f4f5;
  display: flex;
  font-size: 13px;
  gap: 10px;
  padding: 13px 14px;
}

.benefits ion-icon {
  color: #70e1a2;
  flex: 0 0 auto;
  font-size: 20px;
}

@media (max-width: 900px) {
  .auth-page {
    display: block;
  }

  .auth-panel {
    padding: 34px 22px;
  }

  .info-panel {
    display: none;
  }
}

@media (max-width: 620px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>







