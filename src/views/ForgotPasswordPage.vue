<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <main class="recover-page">
        <section class="recover-panel" aria-label="Recuperar senha Agua+">
          <router-link class="brand" to="/login" aria-label="Voltar para login">
            <span><ion-icon :icon="waterOutline" /></span>
            Agua<b>+</b>
          </router-link>

          <div v-if="!sent" class="content-block">
            <span class="badge">
              <ion-icon :icon="keyOutline" />
              Recuperar acesso
            </span>
            <h1>Esqueceu sua senha?</h1>
            <p>Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha.</p>

            <form @submit.prevent="sendRecovery">
              <label>
                E-mail
                <span class="input-shell">
                  <ion-icon :icon="mailOutline" />
                  <input v-model="email" type="email" autocomplete="email" placeholder="seuemail@instituicao.com" required />
                </span>
              </label>

              <PrimaryButton>
                Enviar link
                <ion-icon :icon="sendOutline" />
              </PrimaryButton>
            </form>
          </div>

          <div v-else class="content-block success-block">
            <span class="success-icon"><ion-icon :icon="checkmarkCircleOutline" /></span>
            <h1>Link enviado.</h1>
            <p>Se o e-mail estiver cadastrado, voce recebera as instrucoes para redefinir sua senha em alguns minutos.</p>
            <PrimaryButton @click="goLogin">
              Voltar para login
              <ion-icon :icon="arrowForwardOutline" />
            </PrimaryButton>
          </div>

          <p class="switch-auth"><router-link to="/login">Voltar para entrar</router-link></p>
        </section>

        <aside class="tips-panel" aria-label="Dicas de seguranca">
          <div class="tips-card">
            <div class="lock"><ion-icon :icon="lockClosedOutline" /></div>
            <h2>Seguranca em primeiro lugar.</h2>
            <p>Use uma senha exclusiva e evite compartilhar acessos da sua instituicao.</p>
            <div class="steps">
              <span>1</span><p>Confirme o e-mail cadastrado.</p>
              <span>2</span><p>Acesse o link de recuperacao.</p>
              <span>3</span><p>Crie uma senha nova e segura.</p>
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
  checkmarkCircleOutline,
  keyOutline,
  lockClosedOutline,
  mailOutline,
  sendOutline,
  waterOutline,
} from 'ionicons/icons';
import PrimaryButton from '../components/PrimaryButton.vue';

const router = useRouter();
const email = ref('');
const sent = ref(false);

const sendRecovery = () => {
  sent.value = true;
};

const goLogin = () => router.push('/login');
</script>

<style scoped>
.recover-page {
  background:
    radial-gradient(circle at 12% 10%, rgba(28, 167, 160, 0.11), transparent 28%),
    linear-gradient(120deg, var(--agua-branco), #f7fbfb 48%, #eaf4f4);
  color: var(--agua-texto);
  display: grid;
  font-family: Poppins, sans-serif;
  grid-template-columns: minmax(420px, 1fr) minmax(380px, 0.8fr);
  min-height: 100%;
}

.recover-panel {
  align-self: center;
  justify-self: center;
  padding: 52px 28px;
  width: min(100%, 510px);
}

.brand {
  align-items: center;
  color: var(--agua-petroleo);
  display: inline-flex;
  font-size: 28px;
  font-weight: 700;
  gap: 9px;
  text-decoration: none;
}

.brand span {
  background: var(--agua-petroleo);
  border-radius: 14px;
  color: var(--agua-branco);
  display: grid;
  height: 44px;
  place-items: center;
  width: 44px;
}

.brand b {
  color: var(--agua-agua);
}

.content-block {
  margin-top: 44px;
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
  margin-bottom: 18px;
  padding: 8px 12px;
}

h1 {
  color: var(--agua-petroleo);
  font-size: clamp(31px, 5vw, 46px);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.08;
  margin: 0 0 14px;
}

.content-block > p {
  color: var(--agua-suave);
  font-size: 14px;
  line-height: 1.7;
  margin: 0 0 26px;
  max-width: 430px;
}

form {
  display: grid;
  gap: 17px;
}

label {
  color: #31535d;
  display: grid;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
}

.input-shell {
  align-items: center;
  background: var(--agua-branco);
  border: 1px solid #d8e1e3;
  border-radius: 14px;
  display: grid;
  gap: 10px;
  grid-template-columns: auto 1fr;
  min-height: 52px;
  padding: 0 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.input-shell:focus-within {
  border-color: var(--agua-agua);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.14);
}

.input-shell ion-icon {
  color: var(--agua-suave);
  font-size: 18px;
}

input {
  background: transparent;
  border: 0;
  color: var(--agua-texto);
  font: 400 14px Poppins, sans-serif;
  outline: none;
  width: 100%;
}

.success-block {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 22px;
  box-shadow: var(--agua-shadow);
  padding: 28px;
}

.success-icon {
  background: #eaf9ef;
  border-radius: 18px;
  color: var(--agua-sucesso);
  display: grid;
  font-size: 34px;
  height: 62px;
  margin-bottom: 18px;
  place-items: center;
  width: 62px;
}

.switch-auth {
  font-size: 12px;
  margin: 24px 0 0;
  text-align: center;
}

.switch-auth a {
  color: var(--agua-petroleo);
  font-weight: 700;
  text-decoration: none;
}

.tips-panel {
  background:
    linear-gradient(145deg, rgba(28, 167, 160, 0.18), transparent 38%),
    var(--agua-petroleo);
  color: var(--agua-branco);
  display: grid;
  overflow: hidden;
  padding: 42px;
  place-items: center;
  position: relative;
}

.tips-panel::before,
.tips-panel::after {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 50%;
  content: '';
  position: absolute;
}

.tips-panel::before {
  height: 430px;
  right: -190px;
  top: -155px;
  width: 430px;
}

.tips-panel::after {
  bottom: -155px;
  height: 330px;
  left: -185px;
  width: 330px;
}

.tips-card {
  max-width: 360px;
  position: relative;
  z-index: 1;
}

.lock {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 28px;
  color: #7de2d9;
  display: grid;
  font-size: 44px;
  height: 88px;
  place-items: center;
  width: 88px;
}

.tips-card h2 {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.08;
  margin: 32px 0 13px;
}

.tips-card > p {
  color: #d3e5e8;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.steps {
  display: grid;
  gap: 12px;
  grid-template-columns: auto 1fr;
  margin-top: 34px;
}

.steps span {
  background: rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  color: #7de2d9;
  display: grid;
  font-size: 12px;
  font-weight: 700;
  height: 28px;
  place-items: center;
  width: 28px;
}

.steps p {
  color: #e6f4f5;
  font-size: 13px;
  line-height: 1.5;
  margin: 4px 0 0;
}

@media (max-width: 820px) {
  .recover-page {
    display: block;
  }

  .recover-panel {
    padding: 34px 22px;
  }

  .tips-panel {
    display: none;
  }
}
</style>
