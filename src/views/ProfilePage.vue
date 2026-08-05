<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Perfil" :show-period="false">
        <section class="profile-grid">
          <article class="profile-card">
            <div class="avatar">{{ initials }}</div>
            <div>
              <span>Administrador</span>
              <h2>{{ name }}</h2>
              <p>{{ accountSummary }}</p>
            </div>
          </article>

          <article class="plan-card">
            <span>Plano atual</span>
            <strong>Institucional</strong>
            <p>{{ connectedMeters }} medidores conectados e relatorios mensais ativos.</p>
          </article>
        </section>

        <section class="settings-grid">
          <article class="form-card">
            <div class="card-title">
              <div>
                <h2>Dados da conta</h2>
                <p>Dados vindos do cadastro e usados nos relatorios.</p>
              </div>
              <span v-if="saved" class="saved-pill">Salvo</span>
            </div>

            <form @submit.prevent="saveProfile">
              <label>
                Nome
                <input v-model="name" type="text" />
              </label>
              <label>
                E-mail
                <input v-model="email" type="email" />
              </label>
              <label>
                Instituicao
                <input v-model="company" type="text" placeholder="Ex: Senac" />
              </label>
              <UnitPicker v-if="unitOptions.length" v-model="unit" :options="unitOptions" />
              <PrimaryButton>Salvar alteracoes</PrimaryButton>
            </form>
          </article>

          <aside class="prefs-card">
            <div class="card-title">
              <div>
                <h2>Preferencias</h2>
                <p>Configuracoes principais do app.</p>
              </div>
            </div>

            <button class="theme-toggle" type="button" @click="changeTheme">
              <span><ion-icon :icon="isDark ? sunnyOutline : moonOutline" /></span>
              <strong>{{ isDark ? 'Usar tema claro' : 'Usar tema escuro' }}</strong>
            </button>

            <div class="prefs-list">
              <div v-for="item in preferenceRows" :key="item.label" class="pref-row">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <div class="danger-actions">
              <button class="logout" type="button" @click="logout">
                <ion-icon :icon="logOutOutline" />
                Sair da conta
              </button>
              <button class="delete-account" type="button" @click="removeAccount">
                <ion-icon :icon="trashOutline" />
                Excluir conta
              </button>
            </div>
          </aside>
        <div v-if="showDeleteModal" class="modal-backdrop" role="presentation" @click.self="closeDeleteModal">
          <section class="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <span class="modal-icon"><ion-icon :icon="trashOutline" /></span>
            <h2 id="delete-title">Excluir conta?</h2>
            <p>Essa acao apaga os dados salvos neste dispositivo e leva voce de volta para o login.</p>
            <div class="modal-actions">
              <button class="cancel-delete" type="button" @click="closeDeleteModal">Cancelar</button>
              <button class="confirm-delete" type="button" @click="confirmDeleteAccount">
                <ion-icon :icon="trashOutline" />
                Excluir conta
              </button>
            </div>
          </section>
        </div>
        </section>
      </AppShell>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { logOutOutline, moonOutline, sunnyOutline, trashOutline } from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';
import PrimaryButton from '../components/PrimaryButton.vue';
import UnitPicker from '../components/UnitPicker.vue';
import { deleteAccount, getAccount, getAvailableUnits, updateAccount } from '../data/account-store.js';
import { getSavedTheme, toggleTheme } from '../data/theme-store.js';

const router = useRouter();
const account = getAccount();
const name = ref(account.name);
const email = ref(account.email);
const company = ref(account.company);
const unit = ref(account.unit);
const saved = ref(false);
const isDark = ref(getSavedTheme() === 'dark');
const connectedMeters = ref(12);
const showDeleteModal = ref(false);

const unitOptions = computed(() => getAvailableUnits(company.value));

watch(unitOptions, (options) => {
  if (options.length && !options.includes(unit.value)) {
    unit.value = '';
  }
});

const initials = computed(() => {
  return String(name.value || 'Usuario Agua')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
});

const accountSummary = computed(() => {
  const companyLabel = company.value || 'Instituicao nao informada';
  const unitLabel = unit.value || 'Unidade nao selecionada';
  return `${companyLabel} - ${unitLabel}`;
});

const preferenceRows = computed(() => [
  { label: 'E-mail cadastrado', value: email.value || 'Nao informado' },
  { label: 'Instituicao', value: company.value || 'Nao informada' },
  { label: 'Unidade principal', value: unit.value || 'Nao selecionada' },
]);

const saveProfile = () => {
  updateAccount({
    name: name.value,
    email: email.value,
    company: company.value,
    unit: unitOptions.value.length ? unit.value : '',
  });

  saved.value = true;
  window.setTimeout(() => {
    saved.value = false;
  }, 1800);
};

const changeTheme = () => {
  isDark.value = toggleTheme() === 'dark';
};

const logout = () => router.push('/login');

const removeAccount = () => {
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const confirmDeleteAccount = () => {
  deleteAccount();
  showDeleteModal.value = false;
  router.replace('/login');
};
</script>

<style scoped>
.profile-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 330px;
  margin-bottom: 20px;
}

.profile-card,
.plan-card,
.form-card,
.prefs-card {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  box-shadow: var(--agua-shadow);
  padding: 20px;
}

.profile-card {
  align-items: center;
  display: flex;
  gap: 16px;
}

.avatar {
  background: linear-gradient(135deg, #0d4b5e, #1ca7a0);
  border-radius: 22px;
  color: #ffffff;
  display: grid;
  flex: 0 0 72px;
  font-size: 24px;
  font-weight: 700;
  height: 72px;
  place-items: center;
  width: 72px;
}

.profile-card span,
.plan-card span {
  color: var(--agua-suave);
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 5px;
}

.profile-card h2,
.card-title h2 {
  color: var(--agua-petroleo);
  font-size: 20px;
  margin: 0 0 5px;
}

.profile-card p,
.plan-card p,
.card-title p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.plan-card {
  display: grid;
  gap: 7px;
}

.plan-card strong {
  color: var(--agua-petroleo);
  font-size: 26px;
  line-height: 1;
}

.settings-grid {
  align-items: start;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 330px;
}

.card-title {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.saved-pill {
  background: #eaf9ef;
  border-radius: 999px;
  color: var(--agua-sucesso);
  font-size: 11px;
  font-weight: 700;
  padding: 7px 10px;
}

form {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-top: 18px;
}

label {
  color: var(--agua-texto);
  display: grid;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
}

input,
select {
  background: var(--agua-branco);
  border: 1px solid var(--agua-input-border);
  border-radius: 14px;
  color: var(--agua-texto);
  font: 400 14px Poppins, sans-serif;
  min-height: 52px;
  outline: none;
  padding: 0 14px;
  width: 100%;
}

select {
  cursor: pointer;
}

input:focus,
select:focus {
  border-color: var(--agua-agua);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.14);
}

form :deep(.primary) {
  grid-column: 1 / -1;
  justify-self: start;
  min-width: 190px;
}

.theme-toggle {
  align-items: center;
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 16px;
  color: var(--agua-texto);
  cursor: pointer;
  display: grid;
  gap: 12px;
  grid-template-columns: auto 1fr;
  margin-top: 18px;
  min-height: 60px;
  padding: 12px;
  text-align: left;
  transition: border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
  width: 100%;
}

.theme-toggle:hover {
  border-color: rgba(28, 167, 160, 0.55);
  transform: translateY(-1px);
}

.theme-toggle span {
  background: rgba(28, 167, 160, 0.14);
  border-radius: 14px;
  color: var(--agua-petroleo);
  display: grid;
  font-size: 22px;
  height: 42px;
  place-items: center;
  transition: transform 0.28s ease, background-color 0.28s ease, color 0.28s ease;
  width: 42px;
}

.theme-toggle:hover span {
  transform: rotate(-10deg) scale(1.04);
}

.theme-toggle strong {
  color: var(--agua-texto);
  font-size: 13px;
}

.prefs-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.pref-row {
  align-items: center;
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  display: grid;
  gap: 6px;
  grid-template-columns: 1fr;
  padding: 13px 14px;
}

.pref-row span {
  color: var(--agua-suave);
  font-size: 12px;
  font-weight: 700;
}

.pref-row strong {
  color: var(--agua-petroleo);
  font-size: 12px;
  line-height: 1.45;
}

.danger-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.logout,
.delete-account {
  align-items: center;
  border-radius: 14px;
  cursor: pointer;
  display: inline-flex;
  font: 700 13px Poppins, sans-serif;
  gap: 8px;
  min-height: 46px;
  padding: 0 14px;
}

.logout {
  background: var(--agua-danger-bg);
  border: 1px solid var(--agua-danger-border);
  color: var(--agua-erro);
}

.delete-account {
  background: var(--agua-erro);
  border: 1px solid var(--agua-erro);
  color: #ffffff;
}


.modal-backdrop {
  align-items: center;
  background: rgba(3, 16, 20, 0.64);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 20;
}

.delete-modal {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 22px;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
  color: var(--agua-texto);
  display: grid;
  gap: 14px;
  max-width: 430px;
  padding: 24px;
  width: min(100%, 430px);
}

.modal-icon {
  background: var(--agua-danger-bg);
  border: 1px solid var(--agua-danger-border);
  border-radius: 18px;
  color: var(--agua-erro);
  display: grid;
  font-size: 28px;
  height: 58px;
  place-items: center;
  width: 58px;
}

.delete-modal h2 {
  color: var(--agua-petroleo);
  font-size: 22px;
  margin: 0;
}

.delete-modal p {
  color: var(--agua-suave);
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 4px;
}

.cancel-delete,
.confirm-delete {
  align-items: center;
  border-radius: 14px;
  cursor: pointer;
  display: inline-flex;
  font: 700 13px Poppins, sans-serif;
  gap: 8px;
  min-height: 46px;
  padding: 0 16px;
}

.cancel-delete {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  color: var(--agua-texto);
}

.confirm-delete {
  background: var(--agua-erro);
  border: 1px solid var(--agua-erro);
  color: #ffffff;
}
@media (max-width: 980px) {
  .profile-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  form {
    grid-template-columns: 1fr;
  }

  .profile-card {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>









