<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <AppShell title="Perfil" :show-period="false">
        <section class="profile-hero">
          <article class="identity-card">
            <div class="avatar-preview" :style="avatarStyle">
              <img v-if="avatarImage" :src="avatarImage" alt="" @error="clearAvatarImage" />
              <span v-else>{{ initials }}</span>
            </div>
            <div class="identity-copy">
              <span>{{ role || 'Cargo nao informado' }}</span>
              <h2>{{ name || 'Usuario Agua+' }}</h2>
              <p>{{ accountSummary }}</p>
            </div>
            <button class="edit-toggle" type="button" @click="isEditing = !isEditing">
              <ion-icon :icon="isEditing ? closeOutline : createOutline" />
              {{ isEditing ? 'Fechar edicao' : 'Editar perfil' }}
            </button>
          </article>

          <article class="plan-card">
            <span>Plano atual</span>
            <strong>Institucional</strong>
            <p>{{ connectedMeters }} medidores preparados para sincronizacao e relatorios mensais ativos.</p>
            <div class="plan-meter">
              <i />
            </div>
          </article>
        </section>

        <section v-if="showVerificationCard" class="verification-card">
          <span class="verification-icon"><ion-icon :icon="mailUnreadOutline" /></span>
          <div>
            <strong>Verificacao de e-mail pendente</strong>
            <p>Confirme o e-mail cadastrado para deixar sua conta ativa e pronta para receber alertas importantes.</p>
            <p v-if="verificationMessage" class="verification-message">{{ verificationMessage }}</p>
          </div>
          <div class="verification-actions">
            <button
              v-if="!isGoogleVerification"
              class="secondary-action"
              type="button"
              :disabled="verificationLoading"
              @click="requestEmailVerification"
            >
              <ion-icon :icon="mailUnreadOutline" />
              Enviar verificacao
            </button>
            <button class="secondary-action confirm" type="button" :disabled="verificationLoading" @click="confirmEmailVerification">
              <ion-icon :icon="shieldCheckmarkOutline" />
              {{ isGoogleVerification ? 'Confirmar com Google' : 'Ja verifiquei' }}
            </button>
          </div>
        </section>

        <section class="profile-layout">
          <article class="form-card">
            <div class="card-title">
              <div>
                <h2>Dados e personalizacao</h2>
                <p>Informacoes usadas no app, nos relatorios e na identificacao da unidade.</p>
              </div>
              <span v-if="saved" class="saved-pill">
                <ion-icon :icon="checkmarkCircleOutline" />
                Salvo
              </span>
            </div>

            <form @submit.prevent="saveProfile">
              <div class="form-section">
                <span>Dados principais</span>
                <div class="field-grid">
                  <label>
                    Nome completo
                    <input :value="name" type="text" :disabled="!isEditing" @input="updateName" />
                  </label>
                  <label>
                    Cargo
                    <select v-model="role" :disabled="!isEditing">
                      <option value="" disabled>Selecione seu cargo</option>
                      <option v-for="option in roleOptions" :key="option" :value="option">{{ option }}</option>
                    </select>
                  </label>
                  <label>
                    E-mail
                    <input v-model="email" type="email" :disabled="!isEditing" />
                  </label>
                  <label>
                    Telefone
                    <input
                      :value="phone"
                      type="tel"
                      :disabled="!isEditing"
                      inputmode="numeric"
                      maxlength="15"
                      placeholder="(00) 00000-0000"
                      @input="updatePhone"
                    />
                  </label>
                </div>
              </div>

              <div class="form-section">
                <span>Instituicao monitorada</span>
                <div class="field-grid">
                  <label>
                    Instituicao
                    <input
                      :value="company"
                      type="text"
                      :disabled="!isEditing"
                      placeholder="Ex: Senac"
                      @input="updateCompany"
                    />
                  </label>
                  <UnitPicker
                    v-if="unitOptions.length"
                    v-model="unit"
                    :options="unitOptions"
                    :institution-name="detectedInstitutionName"
                    :disabled="!isEditing"
                  />
                  <label v-else>
                    Unidade principal
                    <input v-model="unit" type="text" :disabled="!isEditing" placeholder="Ex: Campus Centro" />
                  </label>
                </div>
              </div>

              <div class="form-section">
                <span>Aparencia do perfil</span>
                <div class="customization-panel">
                  <div class="avatar-editor">
                    <div class="avatar-preview compact" :style="avatarStyle">
                      <img v-if="avatarImage" :src="avatarImage" alt="" @error="clearAvatarImage" />
                      <span v-else>{{ initials }}</span>
                    </div>
                    <div>
                      <strong>Foto ou cor do avatar</strong>
                      <p>Use uma foto de perfil ou mantenha as iniciais com uma cor propria.</p>
                    </div>
                  </div>
                  <input
                    ref="profilePhotoInput"
                    accept="image/png,image/jpeg,image/webp"
                    class="hidden-file"
                    type="file"
                    @change="handleProfilePhoto"
                  />
                  <div class="photo-actions">
                    <button class="secondary-action" type="button" :disabled="!isEditing" @click="chooseProfilePhoto">
                      <ion-icon :icon="imageOutline" />
                      Escolher foto
                    </button>
                    <button
                      v-if="avatarImage"
                      class="secondary-action"
                      type="button"
                      :disabled="!isEditing"
                      @click="removeProfilePhoto"
                    >
                      <ion-icon :icon="closeOutline" />
                      Remover foto
                    </button>
                  </div>
                  <div class="color-options" role="radiogroup" aria-label="Cor do avatar">
                    <button
                      v-for="option in avatarColors"
                      :key="option.value"
                      class="color-swatch"
                      :class="{ active: avatarColor === option.value }"
                      :style="{ background: option.value }"
                      :aria-label="option.label"
                      :disabled="!isEditing"
                      type="button"
                      @click="avatarColor = option.value"
                    />
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button class="secondary-action" type="button" @click="resetChanges">
                  <ion-icon :icon="refreshOutline" />
                  Restaurar
                </button>
                <PrimaryButton :disabled="!isEditing">Salvar alteracoes</PrimaryButton>
              </div>
            </form>
          </article>

          <aside class="prefs-card">
            <div class="card-title">
              <div>
                <h2>Preferencias</h2>
                <p>Como o Agua+ deve se comportar para esta conta.</p>
              </div>
            </div>

            <button class="theme-toggle" type="button" @click="changeTheme">
              <span><ion-icon :icon="isDark ? sunnyOutline : moonOutline" /></span>
              <strong>{{ isDark ? 'Usar tema claro' : 'Usar tema escuro' }}</strong>
            </button>

            <div class="toggle-list">
              <label class="switch-row">
                <span>
                  Alertas por e-mail
                  <small>Receber avisos quando houver consumo fora do padrao.</small>
                </span>
                <input v-model="emailAlerts" type="checkbox" />
              </label>
              <label class="switch-row">
                <span>
                  Resumo automatico
                  <small>Preparar o relatorio semanal assim que houver leituras.</small>
                </span>
                <input v-model="weeklyReport" type="checkbox" />
              </label>
            </div>

            <div class="frequency-block">
              <span>Frequencia do resumo</span>
              <div class="segmented-control">
                <button
                  v-for="option in reportOptions"
                  :key="option"
                  :class="{ active: reportFrequency === option }"
                  type="button"
                  @click="reportFrequency = option"
                >
                  {{ option }}
                </button>
              </div>
            </div>

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

          <div v-if="showLogoutModal" class="modal-backdrop" role="presentation" @click.self="closeLogoutModal">
            <section class="delete-modal logout-modal" role="dialog" aria-modal="true" aria-labelledby="logout-title">
              <span class="modal-icon logout-icon"><ion-icon :icon="logOutOutline" /></span>
              <h2 id="logout-title">Sair da conta?</h2>
              <p>Voce sera levado para a tela de login e podera entrar novamente quando quiser.</p>
              <div class="modal-actions">
                <button class="cancel-delete" type="button" @click="closeLogoutModal">Cancelar</button>
                <button class="confirm-logout" type="button" @click="confirmLogout">
                  <ion-icon :icon="logOutOutline" />
                  Sair
                </button>
              </div>
            </section>
          </div>

          <div v-if="showDeleteModal" class="modal-backdrop" role="presentation" @click.self="closeDeleteModal">
            <section class="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
              <span class="modal-icon"><ion-icon :icon="trashOutline" /></span>
              <h2 id="delete-title">Excluir conta?</h2>
              <p>Essa acao apaga sua conta do Firebase, os dados salvos neste dispositivo e leva voce de volta para o login.</p>
              <p v-if="deleteError" class="modal-error">{{ deleteError }}</p>
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  checkmarkCircleOutline,
  closeOutline,
  createOutline,
  imageOutline,
  logOutOutline,
  mailUnreadOutline,
  moonOutline,
  refreshOutline,
  shieldCheckmarkOutline,
  sunnyOutline,
  trashOutline,
} from 'ionicons/icons';
import AppShell from '../components/AppShell.vue';
import PrimaryButton from '../components/PrimaryButton.vue';
import UnitPicker from '../components/UnitPicker.vue';
import {
  clearActiveAccount,
  deleteAccount,
  getAccount,
  getAvailableUnits,
  getDetectedInstitution,
  ROLE_OPTIONS,
  updateAccount,
} from '../data/account-store.js';
import {
  ensureEmailVerificationNotification,
  ensureEmailVerifiedNotification,
  getNotifications,
  removeNotification,
} from '../data/notifications-store.js';
import { getSavedTheme, toggleTheme } from '../data/theme-store.js';
import {
  confirmCurrentGoogleAccount,
  deleteFirebaseAccount,
  getCurrentProviderIds,
  getCurrentUser,
  getUserProfile,
  logoutFirebase,
  refreshCurrentUser,
  saveUserProfile,
  sendCurrentEmailVerification,
  watchAuthUser,
} from '../services/firebase.js';
import { saveSettings } from '../data/settings-store.js';

const router = useRouter();
const initialUser = getCurrentUser();
const account = getAccount(initialUser ? { uid: initialUser.uid, email: initialUser.email } : null);
const name = ref(account.name);
const email = ref(account.email);
const phone = ref('');
const company = ref(account.company);
const unit = ref(account.unit);
const role = ref(account.role || '');
const avatarColor = ref(account.avatarColor || '#1ca7a0');
const avatarImage = ref(account.avatarImage || '');
const emailAlerts = ref(account.emailAlerts ?? true);
const weeklyReport = ref(account.weeklyReport ?? true);
const reportFrequency = ref(account.reportFrequency || 'Semanal');
const saved = ref(false);
const isEditing = ref(false);
const isDark = ref(getSavedTheme() === 'dark');
const connectedMeters = ref(12);
const showDeleteModal = ref(false);
const showLogoutModal = ref(false);
const profilePhotoInput = ref(null);
const deleteError = ref('');
const emailVerified = ref(account.emailVerified ?? false);
const verificationLoading = ref(false);
const verificationMessage = ref('');
const providerIds = ref([]);
const roleOptions = ROLE_OPTIONS;
let stopProfileAuthListener = null;

const avatarColors = [
  { label: 'Azul agua', value: '#1ca7a0' },
  { label: 'Petroleo', value: '#0d4b5e' },
  { label: 'Verde', value: '#25a55b' },
  { label: 'Roxo', value: '#6658d3' },
  { label: 'Grafite', value: '#334155' },
];

const reportOptions = ['Diario', 'Semanal', 'Mensal'];

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

phone.value = formatPhone(account.phone || '');

const applyAccount = (nextAccount) => {
  name.value = nextAccount.name || '';
  email.value = nextAccount.email || '';
  phone.value = formatPhone(nextAccount.phone || '');
  company.value = nextAccount.company || '';
  unit.value = nextAccount.unit || '';
  role.value = nextAccount.role || '';
  avatarColor.value = nextAccount.avatarColor || '#1ca7a0';
  avatarImage.value = nextAccount.avatarImage || '';
  emailAlerts.value = nextAccount.emailAlerts ?? true;
  weeklyReport.value = nextAccount.weeklyReport ?? true;
  reportFrequency.value = nextAccount.reportFrequency || 'Semanal';
  emailVerified.value = nextAccount.emailVerified ?? false;
};

const unitOptions = computed(() => getAvailableUnits(company.value));
const detectedInstitutionName = computed(() => getDetectedInstitution(company.value)?.name || 'instituicao');

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

const avatarStyle = computed(() => ({
  background: `linear-gradient(135deg, ${avatarColor.value}, #7de2d9)`,
}));

const accountSummary = computed(() => {
  const companyLabel = company.value || 'Instituicao nao informada';
  const unitLabel = unit.value || 'Unidade nao selecionada';
  return `${companyLabel} - ${unitLabel}`;
});

const hasVerificationNotification = () => {
  return getNotifications().some((notification) => notification.id === 'verify-email');
};

const showVerificationCard = computed(() => Boolean(email.value && !emailVerified.value));
const isGoogleVerification = computed(() => providerIds.value.includes('google.com'));

const preferenceRows = computed(() => [
  { label: 'E-mail cadastrado', value: email.value || 'Nao informado' },
  { label: 'Verificacao', value: emailVerified.value ? 'Confirmado' : 'Pendente' },
  { label: 'Cargo', value: role.value || 'Nao informado' },
  { label: 'Telefone', value: phone.value || 'Nao informado' },
  { label: 'Instituicao', value: company.value || 'Nao informada' },
  { label: 'Unidade principal', value: unit.value || 'Nao selecionada' },
  { label: 'Resumo', value: weeklyReport.value ? reportFrequency.value : 'Desativado' },
]);

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

const chooseProfilePhoto = () => {
  if (!isEditing.value) {
    return;
  }

  profilePhotoInput.value?.click();
};

const readFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
};

const resizeProfilePhoto = (dataUrl) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener('load', () => {
      const size = 360;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const side = Math.min(image.width, image.height);
      const sourceX = (image.width - side) / 2;
      const sourceY = (image.height - side) / 2;

      canvas.width = size;
      canvas.height = size;
      context.drawImage(image, sourceX, sourceY, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    });
    image.addEventListener('error', () => resolve(dataUrl));
    image.src = dataUrl;
  });
};

const handleProfilePhoto = async (event) => {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  const dataUrl = await readFileAsDataUrl(file);
  avatarImage.value = await resizeProfilePhoto(dataUrl);
  event.target.value = '';
};

const removeProfilePhoto = () => {
  avatarImage.value = '';
};

const clearAvatarImage = () => {
  avatarImage.value = '';
  updateAccount({ avatarImage: '' });
  const currentUser = getCurrentUser();

  if (currentUser) {
    saveUserProfile(currentUser.uid, { avatarImage: '' }).catch(() => {});
  }
};

const saveProfile = () => {
  const currentUser = getCurrentUser();
  const savedAccount = updateAccount({
    name: name.value,
    email: email.value,
    phone: formatPhone(phone.value),
    company: company.value,
    unit: unit.value,
    role: role.value,
    avatarColor: avatarColor.value,
    avatarImage: avatarImage.value,
    emailAlerts: emailAlerts.value,
    weeklyReport: weeklyReport.value,
    reportFrequency: reportFrequency.value,
    uid: currentUser?.uid || account.uid || '',
    emailVerified: emailVerified.value,
  });

  phone.value = savedAccount.phone;

  if (currentUser) {
    saveUserProfile(currentUser.uid, savedAccount).catch(() => {});
  }

  isEditing.value = false;
  saved.value = true;
  window.setTimeout(() => {
    saved.value = false;
  }, 1800);
};
const resetChanges = () => {
  const currentAccount = getAccount();
  applyAccount(currentAccount);
};

watch([emailAlerts, weeklyReport, reportFrequency], () => {
  const preferences = {
    emailAlerts: emailAlerts.value,
    weeklyReport: weeklyReport.value,
    reportFrequency: reportFrequency.value,
  };
  updateAccount(preferences);

  const currentUser = getCurrentUser();
  if (currentUser) {
    saveUserProfile(currentUser.uid, preferences).catch(() => {});
  }
});

const changeTheme = () => {
  isDark.value = toggleTheme() === 'dark';
};

const logout = () => {
  showLogoutModal.value = true;
};

const closeLogoutModal = () => {
  showLogoutModal.value = false;
};

const confirmLogout = async () => {
  await logoutFirebase();
  clearActiveAccount();
  showLogoutModal.value = false;
  router.replace('/login');
};

const removeAccount = () => {
  deleteError.value = '';
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteError.value = '';
};

const getVerificationErrorMessage = (error) => {
  const code = error?.code || '';

  if (code.includes('too-many-requests')) {
    return 'O Firebase bloqueou temporariamente muitos envios. Aguarde alguns minutos e tente de novo.';
  }

  if (code.includes('unauthorized-continue-uri') || code.includes('invalid-continue-uri')) {
    return 'O dominio atual nao esta autorizado no Firebase para links de verificacao.';
  }

  if (code.includes('requires-recent-login')) {
    return 'Entre na conta novamente e tente enviar a verificacao logo em seguida.';
  }

  return error?.message || 'Nao foi possivel enviar a verificacao agora.';
};

const markEmailAsVerified = async () => {
  emailVerified.value = true;
  verificationMessage.value = '';
  const savedAccount = updateAccount({ emailVerified: true });
  const currentUser = getCurrentUser();

  if (currentUser) {
    await saveUserProfile(currentUser.uid, { emailVerified: true });
  }

  applyAccount(savedAccount);
  removeNotification('verify-email');
  ensureEmailVerifiedNotification();
};

const requestEmailVerification = async () => {
  verificationMessage.value = '';

  try {
    verificationLoading.value = true;
    if (isGoogleVerification.value) {
      verificationMessage.value = 'Esta conta usa Google. Confirme pelo popup do Google para ativar a verificacao no Agua+.';
      return;
    }

    const verification = await sendCurrentEmailVerification();

    if (verification.alreadyVerifiedByFirebase) {
      verificationMessage.value =
        'Este e-mail ja aparece como verificado no Firebase. Use "Ja verifiquei" para sincronizar com o Agua+.';
      return;
    }

    ensureEmailVerificationNotification();
    verificationMessage.value = 'Enviamos um link de verificacao para o seu e-mail. Depois de confirmar, volte aqui e clique em "Ja verifiquei".';
  } catch (error) {
    verificationMessage.value = getVerificationErrorMessage(error);
  } finally {
    verificationLoading.value = false;
  }
};

const confirmEmailVerification = async () => {
  verificationMessage.value = '';

  try {
    verificationLoading.value = true;

    if (isGoogleVerification.value) {
      const confirmed = await confirmCurrentGoogleAccount();

      if (!confirmed) {
        verificationMessage.value = 'A conta Google selecionada nao corresponde ao e-mail cadastrado.';
        return;
      }

      await markEmailAsVerified();
      verificationMessage.value = 'Conta Google confirmada com sucesso.';
      return;
    }

    const isVerified = await refreshCurrentUser();

    if (!isVerified) {
      ensureEmailVerificationNotification();
      verificationMessage.value = 'Ainda nao consta como verificado. Abra o link enviado no e-mail e tente novamente.';
      return;
    }

    await markEmailAsVerified();
    verificationMessage.value = 'Conta verificada com sucesso.';
  } catch (error) {
    verificationMessage.value = error?.message || 'Nao foi possivel conferir a verificacao agora.';
  } finally {
    verificationLoading.value = false;
  }
};

const confirmDeleteAccount = async () => {
  try {
    await deleteFirebaseAccount();
    deleteAccount();
    showDeleteModal.value = false;
    router.replace('/login');
  } catch (error) {
    if (error?.code === 'auth/requires-recent-login') {
      deleteError.value = 'Por seguranca, entre com Google novamente e tente excluir a conta logo em seguida.';
      return;
    }

    deleteError.value = error?.message || 'Nao foi possivel excluir a conta agora.';
  }
};

const syncProfileFromFirebase = async (currentUser) => {
  try {
    if (!currentUser) {
      return;
    }

    providerIds.value = getCurrentProviderIds();
    const remoteProfile = await getUserProfile(currentUser.uid);
    if (remoteProfile?.settings) {
      saveSettings(remoteProfile.settings);
    }

    const hasPendingVerification = hasVerificationNotification();
    const storedVerified = hasPendingVerification ? false : remoteProfile?.emailVerified ?? account.emailVerified ?? false;
    const mergedAccount = updateAccount({
      ...(remoteProfile || {}),
      uid: currentUser.uid,
      email: currentUser.email || remoteProfile?.email || email.value,
      name: remoteProfile?.name || currentUser.displayName || name.value,
      avatarImage: remoteProfile?.avatarImage || currentUser.photoURL || avatarImage.value,
      emailVerified: storedVerified,
    });

    applyAccount(mergedAccount);

    if (storedVerified) {
      removeNotification('verify-email');
      ensureEmailVerifiedNotification();
    } else {
      ensureEmailVerificationNotification();
    }
  } catch (error) {
    const currentUser = getCurrentUser();
    applyAccount(getAccount(currentUser ? { uid: currentUser.uid, email: currentUser.email } : null));
  }
};

onMounted(() => {
  syncProfileFromFirebase(getCurrentUser());
  stopProfileAuthListener = watchAuthUser((user) => {
    syncProfileFromFirebase(user);
  });
});

onUnmounted(() => {
  stopProfileAuthListener?.();
});
</script>

<style scoped>
.profile-hero {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 330px;
  margin-bottom: 20px;
}

.identity-card,
.plan-card,
.verification-card,
.form-card,
.prefs-card {
  background: var(--agua-branco);
  border: 1px solid var(--agua-borda);
  border-radius: 18px;
  box-shadow: var(--agua-shadow);
  padding: 20px;
}

.identity-card {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.avatar-preview {
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: 24px;
  box-shadow: 0 16px 34px rgba(13, 75, 94, 0.22);
  color: #ffffff;
  display: grid;
  flex: 0 0 82px;
  font-size: 26px;
  font-weight: 800;
  height: 82px;
  overflow: hidden;
  place-items: center;
  width: 82px;
}

.avatar-preview img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.avatar-preview span {
  display: block;
}

.avatar-preview.compact {
  border-radius: 18px;
  flex-basis: 58px;
  font-size: 18px;
  height: 58px;
  width: 58px;
}

.identity-copy {
  min-width: 0;
}

.identity-copy span,
.plan-card span,
.form-section > span,
.frequency-block > span {
  color: var(--agua-suave);
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.identity-copy h2,
.card-title h2 {
  color: var(--agua-petroleo);
  font-size: 20px;
  margin: 0 0 5px;
}

.identity-copy p,
.plan-card p,
.card-title p,
.avatar-editor p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.edit-toggle,
.secondary-action {
  align-items: center;
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  color: var(--agua-petroleo);
  cursor: pointer;
  display: inline-flex;
  font: 700 13px Poppins, sans-serif;
  gap: 8px;
  min-height: 46px;
  padding: 0 14px;
}

.edit-toggle:hover,
.secondary-action:hover {
  border-color: rgba(28, 167, 160, 0.55);
}

.plan-card {
  display: grid;
  gap: 8px;
}

.plan-card strong {
  color: var(--agua-petroleo);
  font-size: 26px;
  line-height: 1;
}

.plan-meter {
  background: var(--agua-muted);
  border-radius: 999px;
  height: 8px;
  margin-top: 8px;
  overflow: hidden;
}

.plan-meter i {
  background: linear-gradient(90deg, var(--agua-agua), var(--agua-sucesso));
  display: block;
  height: 100%;
  width: 64%;
}

.verification-card {
  align-items: center;
  display: grid;
  gap: 16px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  margin-bottom: 20px;
}

.verification-icon {
  background: rgba(28, 167, 160, 0.14);
  border-radius: 18px;
  color: var(--agua-petroleo);
  display: grid;
  font-size: 27px;
  height: 58px;
  place-items: center;
  width: 58px;
}

.verification-card strong {
  color: var(--agua-petroleo);
  display: block;
  font-size: 16px;
  margin-bottom: 5px;
}

.verification-card p {
  color: var(--agua-suave);
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.verification-message {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 12px;
  color: var(--agua-petroleo) !important;
  font-weight: 700;
  margin-top: 10px !important;
  padding: 10px 12px;
}

.verification-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.verification-actions .confirm {
  background: var(--agua-petroleo);
  border-color: var(--agua-petroleo);
  color: #ffffff;
}

.secondary-action:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.profile-layout {
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
  align-items: center;
  background: #eaf9ef;
  border-radius: 999px;
  color: var(--agua-sucesso);
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 5px;
  padding: 7px 10px;
}

form {
  display: grid;
  gap: 20px;
  margin-top: 20px;
}

.form-section {
  border-top: 1px solid var(--agua-borda);
  padding-top: 18px;
}

.field-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr 1fr;
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

input:disabled {
  background: var(--agua-muted);
  color: var(--agua-suave);
  cursor: not-allowed;
}

input:focus,
select:focus {
  border-color: var(--agua-agua);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.14);
}

.customization-panel {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 16px;
  display: grid;
  gap: 16px;
  padding: 16px;
}

.avatar-editor {
  align-items: center;
  display: flex;
  gap: 14px;
}

.avatar-editor strong {
  color: var(--agua-petroleo);
  display: block;
  font-size: 14px;
  margin-bottom: 3px;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hidden-file {
  display: none;
}

.photo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.photo-actions .secondary-action:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.color-swatch {
  border: 3px solid transparent;
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5), 0 8px 18px rgba(13, 75, 94, 0.12);
  cursor: pointer;
  height: 34px;
  padding: 0;
  width: 34px;
}

.color-swatch.active {
  border-color: var(--agua-petroleo);
}

.color-swatch:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.form-actions :deep(.primary) {
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
  transition: border-color 0.2s ease, transform 0.2s ease;
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
  width: 42px;
}

.theme-toggle strong {
  color: var(--agua-texto);
  font-size: 13px;
}

.toggle-list,
.prefs-list {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.switch-row {
  align-items: center;
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr auto;
  padding: 13px 14px;
}

.switch-row span {
  color: var(--agua-texto);
  font-size: 12px;
  font-weight: 700;
}

.switch-row small {
  color: var(--agua-suave);
  display: block;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.45;
  margin-top: 4px;
}

.switch-row input {
  accent-color: var(--agua-agua);
  cursor: pointer;
  height: 20px;
  min-height: 20px;
  width: 20px;
}

.frequency-block {
  margin-top: 18px;
}

.segmented-control {
  background: var(--agua-muted);
  border: 1px solid var(--agua-borda);
  border-radius: 14px;
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(3, 1fr);
  padding: 4px;
}

.segmented-control button {
  background: transparent;
  border: 0;
  border-radius: 10px;
  color: var(--agua-suave);
  cursor: pointer;
  font: 700 11px Poppins, sans-serif;
  min-height: 36px;
}

.segmented-control button.active {
  background: var(--agua-branco);
  box-shadow: 0 8px 18px rgba(13, 75, 94, 0.1);
  color: var(--agua-petroleo);
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

.modal-error {
  background: var(--agua-danger-bg);
  border: 1px solid var(--agua-danger-border);
  border-radius: 14px;
  color: var(--agua-erro) !important;
  font-weight: 700;
  padding: 11px 12px;
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

.logout-icon {
  background: rgba(28, 167, 160, 0.14);
  border-color: rgba(28, 167, 160, 0.24);
  color: var(--agua-petroleo);
}

.confirm-logout {
  align-items: center;
  background: var(--agua-petroleo);
  border: 1px solid var(--agua-petroleo);
  border-radius: 14px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font: 700 13px Poppins, sans-serif;
  gap: 8px;
  min-height: 46px;
  padding: 0 16px;
}

@media (max-width: 980px) {
  .profile-hero,
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .identity-card {
    align-items: flex-start;
    grid-template-columns: auto 1fr;
  }

  .verification-card {
    align-items: flex-start;
    grid-template-columns: auto 1fr;
  }

  .verification-actions {
    grid-column: 1 / -1;
    justify-content: stretch;
  }

  .verification-actions .secondary-action {
    justify-content: center;
    width: 100%;
  }

  .edit-toggle {
    grid-column: 1 / -1;
    justify-content: center;
    width: 100%;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>


