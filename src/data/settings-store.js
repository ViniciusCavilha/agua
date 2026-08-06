const SETTINGS_KEY = 'agua-plus-app-settings';
const SETTINGS_EVENT = 'agua-plus-settings-updated';

const fallbackSettings = {
  compactMode: false,
  emailAlerts: true,
  pushAlerts: false,
  weeklySummary: true,
  simulationMode: true,
  presentationMode: false,
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

const dispatchSettingsUpdate = (settings) => {
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
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

  if (!nextSettings.simulationMode) {
    nextSettings.presentationMode = false;
    nextSettings.anomalyDemo = false;
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  const appliedSettings = applySettings(nextSettings);
  dispatchSettingsUpdate(appliedSettings);
  return appliedSettings;
};

export const enablePresentationMode = (settings = getSettings()) => {
  return saveSettings({
    ...settings,
    simulationMode: true,
    presentationMode: true,
    anomalyDemo: true,
    readingInterval: 5,
    defaultPeriod: 'Semanal',
    measurementUnit: 'Litros',
  });
};

export const disablePresentationMode = (settings = getSettings()) => {
  return saveSettings({
    ...settings,
    presentationMode: false,
    anomalyDemo: false,
    readingInterval: 10,
  });
};

export const resetSettings = () => {
  localStorage.removeItem(SETTINGS_KEY);
  const appliedSettings = applySettings(fallbackSettings);
  dispatchSettingsUpdate(appliedSettings);
  return appliedSettings;
};

export const onSettingsChange = (callback) => {
  const listener = (event) => callback(event.detail || getSettings());
  window.addEventListener(SETTINGS_EVENT, listener);
  window.addEventListener('storage', listener);

  return () => {
    window.removeEventListener(SETTINGS_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
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
