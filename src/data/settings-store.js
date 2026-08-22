const SETTINGS_KEY = 'agua-plus-app-settings';
const SETTINGS_EVENT = 'agua-plus-settings-updated';
const SIMULATION_MODE_KEY = 'agua-plus-simulation-mode';

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

const normalizeBoolean = (value, fallback) => {
  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return fallback;
};

const normalizeSettings = (settings = {}) => {
  const merged = { ...fallbackSettings, ...settings };

  return {
    ...merged,
    compactMode: normalizeBoolean(merged.compactMode, fallbackSettings.compactMode),
    emailAlerts: normalizeBoolean(merged.emailAlerts, fallbackSettings.emailAlerts),
    pushAlerts: normalizeBoolean(merged.pushAlerts, fallbackSettings.pushAlerts),
    weeklySummary: normalizeBoolean(merged.weeklySummary, fallbackSettings.weeklySummary),
    simulationMode: normalizeBoolean(merged.simulationMode, fallbackSettings.simulationMode),
    presentationMode: normalizeBoolean(merged.presentationMode, fallbackSettings.presentationMode),
    anomalyDemo: normalizeBoolean(merged.anomalyDemo, fallbackSettings.anomalyDemo),
  };
};

export const applySettings = (settings) => {
  const nextSettings = normalizeSettings(settings);

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
    const explicitSimulationMode = localStorage.getItem(SIMULATION_MODE_KEY);
    const storedSettings = raw ? JSON.parse(raw) : fallbackSettings;
    const nextSettings = explicitSimulationMode === null
      ? storedSettings
      : { ...storedSettings, simulationMode: explicitSimulationMode === 'true' };

    return applySettings(nextSettings);
  } catch (error) {
    return applySettings(fallbackSettings);
  }
};

export const saveSettings = (settings) => {
  const nextSettings = normalizeSettings(settings);
  const explicitSimulationMode = localStorage.getItem(SIMULATION_MODE_KEY);

  if (explicitSimulationMode !== null) {
    nextSettings.simulationMode = explicitSimulationMode === 'true';
  }

  if (!nextSettings.simulationMode) {
    nextSettings.presentationMode = false;
    nextSettings.anomalyDemo = false;
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  const appliedSettings = applySettings(nextSettings);
  dispatchSettingsUpdate(appliedSettings);
  return appliedSettings;
};

export const setSimulationMode = (enabled, settings = getSettings()) => {
  const simulationMode = enabled === true;
  localStorage.setItem(SIMULATION_MODE_KEY, String(simulationMode));

  return saveSettings({
    ...settings,
    simulationMode,
    presentationMode: simulationMode ? settings.presentationMode : false,
    anomalyDemo: simulationMode ? settings.anomalyDemo : false,
  });
};

export const enablePresentationMode = (settings = getSettings()) => {
  localStorage.setItem(SIMULATION_MODE_KEY, 'true');
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
  localStorage.removeItem(SIMULATION_MODE_KEY);
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
    Mensal: '/consumo/mês-passado',
  };

  return routes[period] || '/consumo';
};
