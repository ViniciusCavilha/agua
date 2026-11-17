import { ref } from 'vue';
import { getAccountStorageScope } from './account-store.js';

export const GOALS_KEY = 'agua-plus-goals';
const GOALS_EVENT = 'agua-plus-goals-updated';
const ACCOUNT_EVENT = 'agua-plus-account-updated';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const createGoalId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getGoalsKey = () => `${GOALS_KEY}:${getAccountStorageScope()}`;

const normalizeTarget = (value) => {
  const target = String(value || '').trim();

  if (!target) {
    return 'Meta definida pelo usuário';
  }

  if (/^\d+$/.test(target)) {
    return `${target}%`;
  }

  return target;
};

const loadGoals = () => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(getGoalsKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const persistGoals = () => {
  if (canUseStorage()) {
    localStorage.setItem(getGoalsKey(), JSON.stringify(userGoals.value));
    window.dispatchEvent(new CustomEvent(GOALS_EVENT));
  }
};

export const userGoals = ref(loadGoals());

export const addGoal = ({ area, target }) => {
  const areaLabel = String(area || '').trim();
  const targetLabel = normalizeTarget(target);
  const goalArea = areaLabel || 'Unidade principal';

  const goal = {
    id: createGoalId(),
    title: `Meta para ${goalArea}`,
    description: `Reduzir ${targetLabel} do consumo em ${goalArea}.`,
    progress: 0,
    target: `Meta: ${targetLabel} de redução`,
    status: 'Criada pelo usuário',
    createdAt: new Date().toISOString(),
  };

  userGoals.value = [goal, ...userGoals.value];
  persistGoals();
  return goal;
};

export const removeGoal = (goalId) => {
  userGoals.value = userGoals.value.filter((goal) => goal.id !== goalId);
  persistGoals();
};

export const clearGoals = () => {
  userGoals.value = [];

  if (canUseStorage()) {
    localStorage.removeItem(getGoalsKey());
    window.dispatchEvent(new CustomEvent(GOALS_EVENT));
  }
};

if (typeof window !== 'undefined') {
  const refreshGoals = () => {
    userGoals.value = loadGoals();
  };

  window.addEventListener(ACCOUNT_EVENT, refreshGoals);
  window.addEventListener('storage', refreshGoals);
}
