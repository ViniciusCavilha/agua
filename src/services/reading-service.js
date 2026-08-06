import { formatVolume, getSettings } from '../data/settings-store.js';

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

const emptyReadingsState = {
  stats: [
    { label: 'Esta semana', value: '0 L', detail: 'Consumo acumulado semanal' },
    { label: 'Media diaria', value: '0 L', detail: 'Aguardando dados' },
    { label: 'Pico do dia', value: '0 L', detail: 'Aguardando dados' },
    { label: 'Custo estimado', value: 'R$ 0,00', detail: 'Aguardando tarifa' },
  ],
  weeklyBars: weekDays.map((day) => ({ day, value: 0, liters: '0 L' })),
  readings: [],
  source: 'simulated',
};

export const getConsumptionReadings = (settings = getSettings()) => {
  const stats = emptyReadingsState.stats.map((item) => {
    if (item.value === '0 L') {
      return { ...item, value: formatVolume(0, settings) };
    }

    return item;
  });

  const weeklyBars = emptyReadingsState.weeklyBars.map((bar, index) => {
    if (!settings.simulationMode) {
      return { ...bar, liters: formatVolume(0, settings) };
    }

    if (settings.anomalyDemo && index === emptyReadingsState.weeklyBars.length - 1) {
      return { ...bar, value: 72, liters: formatVolume(720, settings) };
    }

    return { ...bar, liters: formatVolume(0, settings) };
  });

  return {
    ...emptyReadingsState,
    stats,
    weeklyBars,
    readings: [...emptyReadingsState.readings],
  };
};

export const getPeriodConsumptionReadings = ({ periodLabel, days }, settings = getSettings()) => {
  return {
    stats: [
      { label: periodLabel, value: formatVolume(0, settings), detail: 'Aguardando dados' },
      { label: 'Media diaria', value: formatVolume(0, settings), detail: 'Aguardando dados' },
      { label: 'Pico do periodo', value: formatVolume(0, settings), detail: 'Aguardando dados' },
      { label: 'Custo estimado', value: 'R$ 0,00', detail: 'Aguardando tarifa' },
    ],
    bars: days.map((day) => ({ day, value: 0, liters: formatVolume(0, settings) })),
    readings: [],
    source: 'simulated',
  };
};
