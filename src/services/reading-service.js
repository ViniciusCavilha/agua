import { formatVolume, getSettings } from '../data/settings-store.js';

export const READING_PAYLOAD_VERSION = 'agua-plus-reading-v1';

export const SIMULATED_DEVICE_ID = 'sim-esp32-flow-001';
export const SIMULATED_DEVICE_CODE = 'ESP32-FLOW-001';
export const SIMULATED_SENSOR_ID = 'sim-flow-yf-s201-001';
export const SIMULATED_SENSOR_CODE = 'FLOW-YF-S201-001';

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const todayIndex = weekDays.length - 1;
const presentationLiters = [420, 510, 465, 590, 540, 380, 720];
const presentationFlowRates = [7.8, 8.6, 7.1, 9.4, 8.9, 6.2, 14.8];
const deviceSimulationFactors = [1, 0.72, 0.58, 1.18, 0.86, 0.64];

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
  device = null,
  deviceIndex = 0,
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
    deviceId: device?.id || SIMULATED_DEVICE_ID,
    deviceCode: device?.deviceCode || SIMULATED_DEVICE_CODE,
    sensorId: device?.sensor?.sensorCode || SIMULATED_SENSOR_ID,
    sensorCode: device?.sensor?.sensorCode || SIMULATED_SENSOR_CODE,
    unitId: device?.unit || '',
    calibrationFactor: device?.sensor?.calibrationFactor || 7.5,
    liters,
    flowRate,
    pulseCount: calculatePulseCount(liters, device?.sensor?.calibrationFactor || 7.5),
    intervalSeconds: device?.readingInterval || settings.readingInterval,
    status,
    source: 'simulated',
    timestamp,
    receivedAt: timestamp,
    id: `${device?.id || SIMULATED_DEVICE_ID}-sim-${deviceIndex}-${dayIndex}-${timestamp.getTime()}`,
  });
};

export const getSimulatedReadingsForDevice = (device, settings = getSettings(), deviceIndex = 0) => {
  if (!settings.simulationMode) {
    return [];
  }

  const factor = deviceSimulationFactors[deviceIndex % deviceSimulationFactors.length];
  const isOffline = device?.status === 'Offline';
  const isMaintenance = device?.status === 'Manutencao';
  const statusMultiplier = isOffline ? 0 : isMaintenance ? 0.35 : 1;

  if (settings.presentationMode) {
    return weekDays.map((day, index) => {
      const isToday = index === todayIndex;
      const anomaly = settings.anomalyDemo && isToday && deviceIndex === 0;
      const liters = Math.round((anomaly ? 920 : presentationLiters[index]) * factor * statusMultiplier);
      const flowRate = Number(((anomaly ? 18.5 : presentationFlowRates[index]) * factor * statusMultiplier).toFixed(1));

      return createSimulatedReading({
        device,
        deviceIndex,
        dayIndex: index,
        liters,
        flowRate,
        minutesAgo: isToday ? 8 : (todayIndex - index) * 24 * 60,
        status: anomaly ? 'anomaly' : 'normal',
        settings,
      });
    });
  }

  const anomaly = settings.anomalyDemo && deviceIndex === 0 && !isOffline;
  const litersToday = anomaly ? Math.round(720 * factor) : 0;
  const flowToday = anomaly ? Number((18 * factor).toFixed(1)) : 0;
  const status = anomaly ? 'anomaly' : 'normal';

  return weekDays.map((day, index) =>
    createSimulatedReading({
      device,
      deviceIndex,
      dayIndex: index,
      liters: index === todayIndex ? litersToday : 0,
      flowRate: index === todayIndex ? flowToday : 0,
      minutesAgo: (todayIndex - index) * 24 * 60,
      status: index === todayIndex ? status : 'normal',
      settings,
    }),
  );
};

export const getSimulatedReadingsForDevices = (devices = [], settings = getSettings()) => {
  return devices.flatMap((device, index) => getSimulatedReadingsForDevice(device, settings, index));
};

const getSimulatedReadings = (settings = getSettings(), devices = null) => {
  if (Array.isArray(devices)) {
    return getSimulatedReadingsForDevices(devices, settings);
  }

  return getSimulatedReadingsForDevice(null, settings, 0);
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

export const getConsumptionReadings = (settings = getSettings(), devices = null) => {
  const rawReadings = getSimulatedReadings(settings, devices);

  return {
    ...emptyReadingsState,
    stats: buildStats(rawReadings, settings),
    weeklyBars: buildWeeklyBars(rawReadings, settings),
    readings: formatDisplayReadings(rawReadings, settings),
    rawReadings,
  };
};

const buildPeriodReadings = ({ days = [], offsetDays = 7 }, settings, devices = []) => {
  if (!settings.simulationMode || !settings.presentationMode || !devices.length) {
    return [];
  }

  return devices.flatMap((device, deviceIndex) => {
    const factor = deviceSimulationFactors[deviceIndex % deviceSimulationFactors.length] * 0.88;
    const statusMultiplier = device.status === 'Offline' ? 0 : device.status === 'Manutencao' ? 0.3 : 1;

    return days.map((day, index) => {
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - offsetDays - Math.max(0, days.length - 1 - index));
      timestamp.setMinutes(timestamp.getMinutes() - ((deviceIndex + 1) * 9));

      const baseIndex = index % presentationLiters.length;
      const liters = Math.round(presentationLiters[baseIndex] * factor * statusMultiplier);
      const flowRate = Number((presentationFlowRates[baseIndex] * factor * statusMultiplier).toFixed(1));

      return {
        ...normalizeReadingPayload({
          id: `${device.id}-period-${offsetDays}-${index}`,
          deviceId: device.id,
          deviceCode: device.deviceCode,
          sensorId: device.sensor?.sensorCode,
          sensorCode: device.sensor?.sensorCode,
          unitId: device.unit || '',
          liters,
          flowRate,
          calibrationFactor: device.sensor?.calibrationFactor || 7.5,
          intervalSeconds: device.readingInterval || settings.readingInterval,
          status: 'normal',
          source: 'simulated',
          timestamp,
          receivedAt: timestamp,
        }),
        periodDayIndex: index,
      };
    });
  });
};

const buildPeriodBars = (days, readings, settings) => {
  const totals = days.map((day, index) =>
    readings.reduce((sum, reading) => (reading.periodDayIndex === index ? sum + Number(reading.liters || 0) : sum), 0),
  );
  const max = Math.max(...totals, 1);

  return days.map((day, index) => ({
    day,
    value: totals[index] ? Math.max(8, Math.round((totals[index] / max) * 72)) : 0,
    liters: formatVolume(totals[index], settings),
  }));
};

export const getPeriodConsumptionReadings = ({ periodLabel, days }, settings = getSettings(), devices = []) => {
  const offsetDays = String(periodLabel || '').toLowerCase().includes('mes') ? 30 : 7;
  const rawReadings = buildPeriodReadings({ days, offsetDays }, settings, devices);
  const total = rawReadings.reduce((sum, reading) => sum + reading.liters, 0);
  const peak = rawReadings.reduce((max, reading) => Math.max(max, reading.liters), 0);
  const dailyAverage = days.length ? total / days.length : 0;

  return {
    stats: [
      { label: periodLabel, value: formatVolume(total, settings), detail: rawReadings.length ? 'Consumo simulado por dispositivo' : 'Aguardando dados' },
      { label: 'Media diaria', value: formatVolume(dailyAverage, settings), detail: rawReadings.length ? 'Calculada a partir das leituras' : 'Aguardando dados' },
      { label: 'Pico do periodo', value: formatVolume(peak, settings), detail: rawReadings.length ? 'Maior leitura registrada' : 'Aguardando dados' },
      { label: 'Custo estimado', value: 'R$ 0,00', detail: 'Aguardando tarifa' },
    ],
    bars: buildPeriodBars(days, rawReadings, settings),
    readings: formatDisplayReadings(rawReadings, settings),
    rawReadings,
    source: 'simulated',
    payloadVersion: READING_PAYLOAD_VERSION,
  };
};
