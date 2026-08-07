export const SENAC_UNITS = [
  'Senac Nacional',
  'Senac AC',
  'Senac AL',
  'Senac AM',
  'Senac AP',
  'Senac BA',
  'Senac CE',
  'Senac DF',
  'Senac ES',
  'Senac GO',
  'Senac MA',
  'Senac MG',
  'Senac MS',
  'Senac MT',
  'Senac PA',
  'Senac PB',
  'Senac PE',
  'Senac PI',
  'Senac PR',
  'Senac RJ',
  'Senac RN',
  'Senac RO',
  'Senac RR',
  'Senac RS',
  'Senac SC',
  'Senac SE',
  'Senac SP',
  'Senac TO',
];

export const SESC_UNITS = [
  'Sesc Nacional',
  'Sesc AC',
  'Sesc AL',
  'Sesc AM',
  'Sesc AP',
  'Sesc BA',
  'Sesc CE',
  'Sesc DF',
  'Sesc ES',
  'Sesc GO',
  'Sesc MA',
  'Sesc MG',
  'Sesc MS',
  'Sesc MT',
  'Sesc PA',
  'Sesc PB',
  'Sesc PE',
  'Sesc PI',
  'Sesc PR',
  'Sesc RJ',
  'Sesc RN',
  'Sesc RO',
  'Sesc RR',
  'Sesc RS',
  'Sesc SC',
  'Sesc SE',
  'Sesc SP',
  'Sesc TO',
];

export const SENAI_UNITS = [
  'Senai Nacional',
  'Senai AC',
  'Senai AL',
  'Senai AM',
  'Senai AP',
  'Senai BA',
  'Senai CE',
  'Senai DF',
  'Senai ES',
  'Senai GO',
  'Senai MA',
  'Senai MG',
  'Senai MS',
  'Senai MT',
  'Senai PA',
  'Senai PB',
  'Senai PE',
  'Senai PI',
  'Senai PR',
  'Senai RJ',
  'Senai RN',
  'Senai RO',
  'Senai RR',
  'Senai RS',
  'Senai SC',
  'Senai SE',
  'Senai SP',
  'Senai TO',
];

export const INSTITUTION_UNIT_GROUPS = [
  {
    name: 'Senac',
    match: 'senac',
    units: SENAC_UNITS,
  },
  {
    name: 'Sesc',
    match: 'sesc',
    units: SESC_UNITS,
  },
  {
    name: 'Senai',
    match: 'senai',
    units: SENAI_UNITS,
  },
];

export const ROLE_OPTIONS = [
  'Administrador',
  'Gestor',
  'Coordenador',
  'Supervisor',
  'Tecnico de manutencao',
  'Analista',
  'Professor',
  'Aluno',
  'Responsavel pela unidade',
  'Outro',
];

const ACCOUNT_KEY = 'agua-plus-account';
const ACCOUNT_EVENT = 'agua-plus-account-updated';
const ACTIVE_ACCOUNT_KEY = 'agua-plus-active-account-key';

const fallbackAccount = {
  uid: '',
  name: '',
  phone: '',
  email: '',
  company: '',
  unit: '',
  role: '',
  avatarColor: '#1ca7a0',
  avatarImage: '',
  emailAlerts: true,
  weeklyReport: true,
  reportFrequency: 'Semanal',
  theme: 'light',
  themeConfigured: false,
  emailVerified: false,
  settings: null,
};

const normalizeOwner = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase();
};

const getScopedAccountKey = (account = {}) => {
  if (account.uid) {
    return `${ACCOUNT_KEY}:uid:${account.uid}`;
  }

  if (account.email) {
    return `${ACCOUNT_KEY}:email:${normalizeOwner(account.email)}`;
  }

  return ACCOUNT_KEY;
};

const getActiveAccountKey = () => {
  try {
    return localStorage.getItem(ACTIVE_ACCOUNT_KEY) || '';
  } catch (error) {
    return '';
  }
};

const setActiveAccountKey = (key) => {
  try {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, key);
  } catch (error) {
    // localStorage indisponivel; segue apenas em memoria da pagina.
  }
};

export const isSenacInstitution = (value) => {
  return String(value || '').trim().toLowerCase().includes('senac');
};

export const getDetectedInstitution = (company) => {
  const normalizedCompany = String(company || '').trim().toLowerCase();

  return INSTITUTION_UNIT_GROUPS.find((institution) => normalizedCompany.includes(institution.match)) || null;
};

export const getAvailableUnits = (company) => {
  return getDetectedInstitution(company)?.units || [];
};

export const getAccount = (owner = null) => {
  try {
    const key = owner ? getScopedAccountKey(owner) : getActiveAccountKey();

    if (!key) {
      return { ...fallbackAccount };
    }

    const raw = localStorage.getItem(key);

    if (!raw) {
      return { ...fallbackAccount };
    }

    return { ...fallbackAccount, ...JSON.parse(raw) };
  } catch (error) {
    return { ...fallbackAccount };
  }
};

export const saveAccount = (account) => {
  const nextAccount = { ...fallbackAccount, ...account };
  const key = getScopedAccountKey(nextAccount);
  localStorage.setItem(key, JSON.stringify(nextAccount));
  setActiveAccountKey(key);
  window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT, { detail: nextAccount }));
  return nextAccount;
};

export const updateAccount = (account) => {
  return saveAccount({ ...getAccount(), ...account });
};

export const deleteAccount = () => {
  const activeKey = getActiveAccountKey();

  if (activeKey) {
    localStorage.removeItem(activeKey);
  }

  localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem('agua-plus-goals');
  localStorage.removeItem('agua-plus-notifications');
  window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT, { detail: { ...fallbackAccount } }));
  return { ...fallbackAccount };
};

export const onAccountChange = (callback) => {
  const listener = (event) => callback(event.detail || getAccount());
  window.addEventListener(ACCOUNT_EVENT, listener);
  window.addEventListener('storage', listener);

  return () => {
    window.removeEventListener(ACCOUNT_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
};

export const clearActiveAccount = () => {
  localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  window.dispatchEvent(new CustomEvent(ACCOUNT_EVENT, { detail: { ...fallbackAccount } }));
};
