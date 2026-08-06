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

const fallbackAccount = {
  name: '',
  phone: '',
  email: '',
  company: '',
  unit: '',
  role: '',
  emailVerified: false,
};

export const isSenacInstitution = (value) => {
  return String(value || '').trim().toLowerCase().includes('senac');
};

export const getAvailableUnits = (company) => {
  if (isSenacInstitution(company)) {
    return SENAC_UNITS;
  }

  return [];
};

export const getAccount = () => {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);

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
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextAccount));
  return nextAccount;
};

export const updateAccount = (account) => {
  return saveAccount({ ...getAccount(), ...account });
};

export const deleteAccount = () => {
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem('agua-plus-goals');
  localStorage.removeItem('agua-plus-notifications');
  return { ...fallbackAccount };
};

