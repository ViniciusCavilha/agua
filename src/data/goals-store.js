import { ref } from 'vue';

export const GOALS_KEY = 'agua-plus-goals';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const createGoalId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeTarget = (value) => {
  const target = String(value || '').trim();

  if (!target) {
    return 'Meta definida pelo usuario';
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
    const raw = localStorage.getItem(GOALS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const persistGoals = () => {
  if (canUseStorage()) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(userGoals.value));
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
    target: `Meta: ${targetLabel} de reducao`,
    status: 'Criada pelo usuario',
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
    localStorage.removeItem(GOALS_KEY);
  }
};
