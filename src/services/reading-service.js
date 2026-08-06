import { formatVolume, getSettings } from '../data/settings-store.js';

export const READING_PAYLOAD_VERSION = 'agua-plus-reading-v1';

export const SIMULATED_DEVICE_ID = 'sim-esp32-flow-001';
export const SIMULATED_DEVICE_CODE = 'ESP32-FLOW-001';
export const SIMULATED_SENSOR_ID = 'sim-flow-yf-s201-001';
export const SIMULATED_SENSOR_CODE = 'FLOW-YF-S201-001';

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const todayIndex = weekDays.length - 1;

const emptyStats = [
  { label: 'Esta semana', value: '0 L', detail: 'Consumo acumulado semanal' },
  { label: 'Media diaria', value: '0 L', detail: 'Aguardando dados' },
  { label: 'Pico do dia', value: '0 L', detail: 'Aguardando dados' },
  { label: 'Custo estimado', value: 'R$ 0,00', detail: 'Aguardando tarifa' },
];

const emptyReadingsState = {
  stats: emptyStats,
  weeklyBars: weekDays.map((day) => ({ day, value: 0, liters: '0 L' })),
  readings: [],
  rawReadings: [],
  source: 'simulated',
  payloadVersion: READING_PAYLOAD_VERSION,
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toIsoTimestamp = (value = new Date()) => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const calculatePulseCount = (liters, calibrationFactor) => {
  return Math.round(toNumber(liters) * toNumber(calibrationFactor, 7.5) * 60);
};

export const normalizeReadingPayload = (reading = {}) => {
  const calibrationFactor = toNumber(reading.calibrationFactor, 7.5);
  const liters = toNumber(reading.liters);
  const pulseCount = toNumber(reading.pulseCount || reading.rawPulseCount || calculatePulseCount(liters, calibrationFactor));
  const timestamp = toIsoTimestamp(reading.timestamp || reading.createdAt || reading.receivedAt);

  return {
    schemaVersion: reading.schemaVersion || READING_PAYLOAD_VERSION,
    id: reading.id || `${reading.deviceId || SIMULATED_DEVICE_ID}-${Date.parse(timestamp) || Date.now()}`,
    deviceId: reading.deviceId || SIMULATED_DEVICE_ID,
    deviceCode: reading.deviceCode || SIMULATED_DEVICE_CODE,
    sensorId: reading.sensorId || SIMULATED_SENSOR_ID,
    sensorCode: reading.sensorCode || SIMULATED_SENSOR_CODE,
    unitId: reading.unitId || '',
    liters,
    flowRate: toNumber(reading.flowRate),
    pulseCount,
    rawPulseCount: pulseCount,
    calibrationFactor,
    intervalSeconds: toNumber(reading.intervalSeconds || reading.readingInterval, 10),
    batteryVoltage: reading.batteryVoltage ?? null,
    rssi: reading.rssi ?? null,
    status: reading.status || 'normal',
    source: reading.source || 'simulated',
    timestamp,
    receivedAt: toIsoTimestamp(reading.receivedAt || timestamp),
  };
};

export const createSimulatedReading = ({
  liters = 0,
  flowRate = 0,
  dayIndex = todayIndex,
  minutesAgo = 0,
  status = 'normal',
  settings = getSettings(),
} = {}) => {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - Math.max(0, todayIndex - dayIndex));
  timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

  return normalizeReadingPayload({
    liters,
    flowRate,
    pulseCount: calculatePulseCount(liters, 7.5),
    intervalSeconds: settings.readingInterval,
    status,
    source: 'simulated',
    timestamp,
    receivedAt: timestamp,
  });
};

const getSimulatedReadings = (settings = getSettings()) => {
  if (!settings.simulationMode) {
    return [];
  }

  const litersToday = settings.anomalyDemo ? 720 : 0;
  const flowToday = settings.anomalyDemo ? 18 : 0;
  const status = settings.anomalyDemo ? 'anomaly' : 'normal';

  return weekDays.map((day, index) =>
    createSimulatedReading({
      dayIndex: index,
      liters: index === todayIndex ? litersToday : 0,
      flowRate: index === todayIndex ? flowToday : 0,
      minutesAgo: (todayIndex - index) * 24 * 60,
      status: index === todayIndex ? status : 'normal',
      settings,
    }),
  );
};

const groupLitersByDay = (readings) => {
  return readings.reduce((accumulator, reading) => {
    const date = new Date(reading.timestamp);
    const jsDay = date.getDay();
    const index = jsDay === 0 ? 6 : jsDay - 1;
    accumulator[index] = (accumulator[index] || 0) + reading.liters;
    return accumulator;
  }, Array(7).fill(0));
};

const buildWeeklyBars = (readings, settings) => {
  const totals = groupLitersByDay(readings);
  const max = Math.max(...totals, 1);

  return weekDays.map((day, index) => ({
    day,
    value: totals[index] ? Math.max(8, Math.round((totals[index] / max) * 72)) : 0,
    liters: formatVolume(totals[index], settings),
  }));
};

const buildStats = (readings, settings) => {
  const weeklyTotal = readings.reduce((sum, reading) => sum + reading.liters, 0);
  const dailyAverage = weeklyTotal / weekDays.length;
  const peakReading = readings.reduce((peak, reading) => Math.max(peak, reading.liters), 0);

  return [
    { label: 'Esta semana', value: formatVolume(weeklyTotal, settings), detail: 'Consumo acumulado semanal' },
    { label: 'Media diaria', value: formatVolume(dailyAverage, settings), detail: readings.length ? 'Calculada a partir das leituras' : 'Aguardando dados' },
    { label: 'Pico do dia', value: formatVolume(peakReading, settings), detail: readings.length ? 'Maior leitura diaria registrada' : 'Aguardando dados' },
    { label: 'Custo estimado', value: 'R$ 0,00', detail: 'Aguardando tarifa' },
  ];
};

const formatDisplayReadings = (readings, settings) => {
  return readings
    .slice()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter((reading) => reading.liters > 0 || reading.flowRate > 0 || reading.status === 'anomaly')
    .slice(0, 5)
    .map((reading) => ({
      id: reading.id,
      time: new Date(reading.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      area: reading.deviceCode,
      liters: formatVolume(reading.liters, settings),
      status: reading.status === 'anomaly' ? 'Consumo fora do padrao' : 'Leitura simulada',
      raw: reading,
    }));
};

export const getConsumptionReadings = (settings = getSettings()) => {
  const rawReadings = getSimulatedReadings(settings);

  return {
    ...emptyReadingsState,
    stats: buildStats(rawReadings, settings),
    weeklyBars: buildWeeklyBars(rawReadings, settings),
    readings: formatDisplayReadings(rawReadings, settings),
    rawReadings,
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
    rawReadings: [],
    source: 'simulated',
    payloadVersion: READING_PAYLOAD_VERSION,
  };
};
