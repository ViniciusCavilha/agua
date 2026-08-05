const SETTINGS_KEY = 'agua-plus-app-settings';

const fallbackSettings = {
  compactMode: false,
  emailAlerts: true,
  pushAlerts: false,
  weeklySummary: true,
  simulationMode: true,
  anomalyDemo: false,
  readingInterval: 10,
  defaultPeriod: 'Semanal',
  measurementUnit: 'Litros',
};

export const applySettings = (settings) => {
  const nextSettings = { ...fallbackSettings, ...settings };

  document.documentElement.dataset.compact = nextSettings.compactMode ? 'true' : 'false';
  document.body.dataset.compact = nextSettings.compactMode ? 'true' : 'false';

  return nextSettings;
};

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);

    if (!raw) {
      return applySettings(fallbackSettings);
    }

    return applySettings({ ...fallbackSettings, ...JSON.parse(raw) });
  } catch (error) {
    return applySettings(fallbackSettings);
  }
};

export const saveSettings = (settings) => {
  const nextSettings = { ...fallbackSettings, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  return applySettings(nextSettings);
};

export const resetSettings = () => {
  localStorage.removeItem(SETTINGS_KEY);
  return applySettings(fallbackSettings);
};

export const formatVolume = (liters, settings = getSettings()) => {
  if (settings.measurementUnit === 'Metros cubicos') {
    const cubicMeters = Number(liters || 0) / 1000;
    return `${cubicMeters.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m3`;
  }

  return `${Number(liters || 0).toLocaleString('pt-BR')} L`;
};

export const getDefaultPeriodRoute = (period) => {
  const routes = {
    Diario: '/dashboard',
    Semanal: '/consumo',
    Mensal: '/consumo/mes-passado',
  };

  return routes[period] || '/consumo';
};
