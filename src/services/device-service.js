import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getCurrentUser, getFirestoreDb, isFirebaseReady, waitForCurrentUser } from './firebase.js';
import { getSimulatedReadingsForDevice, normalizeReadingPayload, READING_PAYLOAD_VERSION } from './reading-service.js';
import { getSettings } from '../data/settings-store.js';
import { generateTechnicalAlerts, TECHNICAL_ALERT_TYPES } from './technical-alert-service.js';

const DEVICES_KEY = 'agua-plus-devices';

export const DEVICE_STATUSES = ['Aguardando conexão', 'Ativo', 'Offline', 'Manutenção'];
export const SENSOR_MODELS = ['YF-S201', 'YF-B1', 'Sensor Hall genérico', 'Medidor com saída de pulso', 'Outro'];
export const SENSOR_TYPES = ['Fluxo de água por pulso'];

const normalizeDeviceStatus = (status = '') => ({
  'Aguardando conexao': 'Aguardando conexão',
  Manutencao: 'Manutenção',
}[status] || status || 'Aguardando conexão');

const simulatedDevice = {
  name: 'ESP32 Protótipo',
  deviceCode: 'ESP32-FLOW-001',
  location: 'Bancada de testes',
  unit: '',
  status: 'Aguardando conexão',
  sensor: {
    name: 'YF-S201',
    sensorCode: 'FLOW-YF-S201-001',
    type: 'Fluxo de água por pulso',
    calibrationFactor: 7.5,
  },
  readingInterval: 10,
  totalConsumption: 0,
  lastReadingLiters: 0,
  lastFlowRate: 0,
  lastPulseCount: 0,
  lastReadingAt: null,
};

const createLocalDeviceId = () => {
  if (window.crypto?.randomUUID) {
    return `local-${window.crypto.randomUUID()}`;
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getNextSimulatedSequence = (devices = []) => {
  const usedSequences = new Set(
    devices
      .map((device) => /^ESP32-FLOW-(\d+)$/.exec(String(device.deviceCode || '').toUpperCase()))
      .filter(Boolean)
      .map((match) => Number(match[1])),
  );
  let sequence = 1;

  while (usedSequences.has(sequence)) {
    sequence += 1;
  }

  return sequence;
};

const normalizeDevice = (device = {}) => ({
  id: device.id || `local-${Date.now()}`,
  name: device.name || '',
  deviceCode: device.deviceCode || '',
  location: device.location || '',
  unit: device.unit || '',
  status: normalizeDeviceStatus(device.status),
  sensor: {
    name: device.sensor?.name || 'YF-S201',
    sensorCode: device.sensor?.sensorCode || '',
    type: device.sensor?.type || 'Fluxo de água por pulso',
    calibrationFactor: Number(device.sensor?.calibrationFactor || 7.5),
  },
  readingInterval: Number(device.readingInterval || 10),
  totalConsumption: Number(device.totalConsumption || 0),
  lastReadingLiters: Number(device.lastReadingLiters || 0),
  lastFlowRate: Number(device.lastFlowRate || 0),
  lastPulseCount: Number(device.lastPulseCount || 0),
  lastReadingAt: device.lastReadingAt || null,
  createdAt: device.createdAt || null,
  updatedAt: device.updatedAt || null,
});

const withoutDeviceId = (device) => {
  const payload = { ...device };
  delete payload.id;

  if (!payload.createdAt) {
    delete payload.createdAt;
  }

  if (!payload.updatedAt) {
    delete payload.updatedAt;
  }

  return payload;
};

const getLocalDevices = () => {
  try {
    const raw = localStorage.getItem(DEVICES_KEY);
    return raw ? JSON.parse(raw).map(normalizeDevice) : [];
  } catch (error) {
    return [];
  }
};

const saveLocalDevices = (devices) => {
  const normalized = devices.map(normalizeDevice);
  localStorage.setItem(DEVICES_KEY, JSON.stringify(normalized));
  return normalized;
};

const getUserDevicesCollection = (user = getCurrentUser()) => {
  const db = getFirestoreDb();

  if (!db || !user) {
    return null;
  }

  return collection(db, 'users', user.uid, 'devices');
};

const resolveDeviceUser = async () => {
  if (!isFirebaseReady()) {
    return null;
  }

  return getCurrentUser() || await waitForCurrentUser();
};

const shouldUseLocalDevices = () => !isFirebaseReady();

const sortDevicesByCreatedAt = (devices) =>
  devices.slice().sort((first, second) => {
    const firstDate = first.createdAt?.toDate?.() || new Date(first.createdAt || 0);
    const secondDate = second.createdAt?.toDate?.() || new Date(second.createdAt || 0);
    return secondDate.getTime() - firstDate.getTime();
  });

const deleteSubcollectionDocs = async (deviceRef, subcollectionName) => {
  const snapshot = await getDocs(collection(deviceRef, subcollectionName));
  await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)));
};

const tryDeleteSubcollectionDocs = async (deviceRef, subcollectionName) => {
  try {
    await deleteSubcollectionDocs(deviceRef, subcollectionName);
  } catch (error) {
    // The parent device deletion is the important operation for the current UI.
  }
};

export const listDevices = async () => {
  if (shouldUseLocalDevices()) {
    return getLocalDevices();
  }

  const user = await resolveDeviceUser();

  if (!user) {
    return [];
  }

  const devicesRef = getUserDevicesCollection(user);
  const snapshot = await getDocs(query(devicesRef));
  return sortDevicesByCreatedAt(snapshot.docs.map((item) => normalizeDevice({ ...item.data(), id: item.id })));
};

export const getDeviceById = async (deviceId) => {
  if (!deviceId) {
    return null;
  }

  if (shouldUseLocalDevices()) {
    return getLocalDevices().find((device) => device.id === deviceId) || null;
  }

  const user = await resolveDeviceUser();

  if (!user) {
    return null;
  }

  const devicesRef = getUserDevicesCollection(user);
  const snapshot = await getDoc(doc(devicesRef, deviceId));
  return snapshot.exists() ? normalizeDevice({ ...snapshot.data(), id: snapshot.id }) : null;
};

const buildLocalDeviceReadings = (device) => {
  const settings = getSettings();

  if (!settings.simulationMode || !device) {
    return [];
  }

  return getSimulatedReadingsForDevice(device, settings).filter(
    (reading) => reading.liters > 0 || reading.flowRate > 0 || reading.status === 'anomaly' || settings.presentationMode,
  );
};

const normalizeFirestoreDate = (value) => {
  if (value?.toDate) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value || new Date().toISOString();
};

const normalizeStoredReading = (item) => {
  const storedReading = item.data();

  return normalizeReadingPayload({
    ...storedReading,
    id: item.id,
    source: storedReading.source || 'hardware',
    timestamp: normalizeFirestoreDate(storedReading.timestamp),
    receivedAt: normalizeFirestoreDate(storedReading.receivedAt),
  });
};

export const listDeviceReadings = async (deviceId, { simulationFallback = true } = {}) => {
  const device = await getDeviceById(deviceId);

  if (!device) {
    return [];
  }

  if (shouldUseLocalDevices()) {
    return simulationFallback ? buildLocalDeviceReadings(device) : [];
  }

  const devicesRef = getUserDevicesCollection();
  const snapshot = await getDocs(query(collection(devicesRef, deviceId, 'readings')));
  const readings = snapshot.docs.map(normalizeStoredReading);

  const hasUsefulReadings = readings.some((reading) => reading.liters > 0 || reading.flowRate > 0 || reading.status === 'anomaly');
  return hasUsefulReadings || !simulationFallback || !getSettings().simulationMode ? readings : buildLocalDeviceReadings(device);
};

export const watchDeviceReadings = (deviceIds = [], callback, onError = () => {}) => {
  const user = getCurrentUser();
  const uniqueDeviceIds = [...new Set(deviceIds.filter(Boolean))];

  if (shouldUseLocalDevices() || !user || !uniqueDeviceIds.length) {
    callback([]);
    return () => {};
  }

  const devicesRef = getUserDevicesCollection(user);
  const readingsByDevice = new Map(uniqueDeviceIds.map((deviceId) => [deviceId, []]));
  const emitReadings = () => callback([...readingsByDevice.values()].flat());
  const unsubscribes = uniqueDeviceIds.map((deviceId) =>
    onSnapshot(
      query(collection(devicesRef, deviceId, 'readings')),
      (snapshot) => {
        readingsByDevice.set(deviceId, snapshot.docs.map(normalizeStoredReading));
        emitReadings();
      },
      onError,
    ),
  );

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};

export const listDeviceAlerts = async (deviceId) => {
  const device = await getDeviceById(deviceId);

  if (!device) {
    return [];
  }

  const currentStatusAlerts = generateTechnicalAlerts({ devices: [device] });

  if (shouldUseLocalDevices()) {
    return currentStatusAlerts;
  }

  const devicesRef = getUserDevicesCollection();
  const snapshot = await getDocs(query(collection(devicesRef, deviceId, 'alerts')));
  const deviceStatusTypes = new Set([
    TECHNICAL_ALERT_TYPES.DEVICE_OFFLINE,
    TECHNICAL_ALERT_TYPES.DEVICE_WAITING,
    TECHNICAL_ALERT_TYPES.DEVICE_MAINTENANCE,
  ]);
  const storedAlerts = snapshot.docs
    .map((item) => ({ id: item.id, deviceId, ...item.data() }))
    .filter((alert) => !deviceStatusTypes.has(alert.type));

  return [...currentStatusAlerts, ...storedAlerts];
};

export const listDeviceMaintenanceOrders = async (deviceId) => {
  const device = await getDeviceById(deviceId);

  if (!device) {
    return [];
  }

  if (shouldUseLocalDevices()) {
    return [
      {
        id: `${device.id}-installation-check`,
        title: 'Validar instalação do sensor',
        description: 'Conferir posição do YF-S201, sentido do fluxo e vedação antes das leituras reais.',
        status: 'Planejáda',
      },
    ];
  }

  const devicesRef = getUserDevicesCollection();
  const snapshot = await getDocs(query(collection(devicesRef, deviceId, 'maintenanceOrders')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const createDevice = async (device) => {
  const nextDevice = normalizeDevice({
    ...device,
    totalConsumption: 0,
    lastReadingLiters: 0,
    lastFlowRate: 0,
    lastPulseCount: 0,
    lastReadingAt: null,
  });

  if (shouldUseLocalDevices()) {
    const devices = saveLocalDevices([{ ...nextDevice, id: createLocalDeviceId() }, ...getLocalDevices()]);
    return devices[0];
  }

  const user = await resolveDeviceUser();

  if (!user) {
    throw new Error('Entre na conta antes de cadastrar dispositivos.');
  }

  const devicesRef = getUserDevicesCollection(user);
  const devicePayload = withoutDeviceId(nextDevice);
  const created = await addDoc(devicesRef, {
    ...devicePayload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(doc(devicesRef, created.id, 'sensors', nextDevice.sensor.sensorCode || 'flow-sensor'), {
    ...nextDevice.sensor,
    deviceId: created.id,
    status: nextDevice.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(devicesRef, created.id, 'readings'), {
    ...normalizeReadingPayload({
      deviceId: created.id,
      deviceCode: nextDevice.deviceCode,
      sensorId: nextDevice.sensor.sensorCode || 'flow-sensor',
      sensorCode: nextDevice.sensor.sensorCode || 'flow-sensor',
      calibrationFactor: nextDevice.sensor.calibrationFactor,
      intervalSeconds: nextDevice.readingInterval,
      status: 'waiting',
      source: 'simulated',
    }),
    schemaVersion: READING_PAYLOAD_VERSION,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(devicesRef, created.id, 'alerts'), {
    deviceId: created.id,
    deviceCode: nextDevice.deviceCode,
    type: 'device-waiting',
    title: 'Dispositivo águardando conexão',
    message: 'Este dispositivo simulado está pronto para receber leituras do ESP32 futuramente.',
    status: 'Aberto',
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(devicesRef, created.id, 'maintenanceOrders'), {
    title: 'Validar instalação do sensor',
    description: 'Ordem simulada para registrar a futura verificação fisica do sensor de vazão.',
    status: 'Planejáda',
    createdAt: serverTimestamp(),
  });

  return { ...nextDevice, id: created.id };
};

export const createSimulatedDevice = async (unit = '') => {
  const sequence = getNextSimulatedSequence(await listDevices());
  const suffix = String(sequence).padStart(3, '0');

  return createDevice({
    ...simulatedDevice,
    deviceCode: `ESP32-FLOW-${suffix}`,
    unit,
    sensor: {
      ...simulatedDevice.sensor,
      sensorCode: `FLOW-YF-S201-${suffix}`,
    },
  });
};

export const linkDeviceByCode = async ({
  deviceCode,
  name = '',
  location = '',
  unit = '',
  sensorModel = 'YF-S201',
  sensorCode = '',
  calibrationFactor = 7.5,
  readingInterval = 10,
}) => {
  const normalizedCode = String(deviceCode || '').trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error('Informe o código do dispositivo.');
  }

  const alreadyLinked = (await listDevices()).some(
    (device) => String(device.deviceCode || '').trim().toUpperCase() === normalizedCode,
  );

  if (alreadyLinked) {
    throw new Error('Este dispositivo já esta vinculado a sua conta.');
  }

  return createDevice({
    name: name || `Dispositivo ${normalizedCode}`,
    deviceCode: normalizedCode,
    location,
    unit,
    status: 'Aguardando conexão',
    sensor: {
      name: sensorModel,
      sensorCode: sensorCode || `${normalizedCode}-FLOW`,
      type: 'Fluxo de água por pulso',
      calibrationFactor,
    },
    readingInterval,
  });
};

export const updateDeviceStatus = async (deviceId, status) => {
  if (!DEVICE_STATUSES.includes(status)) {
    return;
  }

  if (shouldUseLocalDevices()) {
    saveLocalDevices(getLocalDevices().map((device) => (device.id === deviceId ? { ...device, status } : device)));
    return;
  }

  const user = await resolveDeviceUser();

  if (!user) {
    throw new Error('Entre na conta antes de atualizar dispositivos.');
  }

  const devicesRef = getUserDevicesCollection(user);
  await setDoc(
    doc(devicesRef, deviceId),
    {
      status,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const updateDevice = async (deviceId, updates) => {
  if (shouldUseLocalDevices()) {
    saveLocalDevices(getLocalDevices().map((device) => (device.id === deviceId ? normalizeDevice({ ...device, ...updates }) : device)));
    return;
  }

  const user = await resolveDeviceUser();

  if (!user) {
    throw new Error('Entre na conta antes de atualizar dispositivos.');
  }

  const currentDevice = await getDeviceById(deviceId);

  if (!currentDevice) {
    throw new Error('Dispositivo nao encontrado.');
  }

  const nextUpdates = normalizeDevice({
    ...currentDevice,
    ...updates,
    sensor: {
      ...currentDevice.sensor,
      ...updates.sensor,
    },
    id: deviceId,
  });
  const payload = withoutDeviceId(nextUpdates);

  const devicesRef = getUserDevicesCollection(user);
  await setDoc(
    doc(devicesRef, deviceId),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(devicesRef, deviceId, 'sensors', payload.sensor.sensorCode || 'flow-sensor'),
    {
      ...payload.sensor,
      deviceId,
      status: payload.status,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const removeDevice = async (deviceId) => {
  if (shouldUseLocalDevices()) {
    saveLocalDevices(getLocalDevices().filter((device) => device.id !== deviceId));
    return;
  }

  const user = await resolveDeviceUser();

  if (!user) {
    throw new Error('Entre na conta antes de remover dispositivos.');
  }

  const devicesRef = getUserDevicesCollection(user);
  const deviceRef = doc(devicesRef, deviceId);

  await Promise.all([
    tryDeleteSubcollectionDocs(deviceRef, 'sensors'),
    tryDeleteSubcollectionDocs(deviceRef, 'readings'),
    tryDeleteSubcollectionDocs(deviceRef, 'alerts'),
    tryDeleteSubcollectionDocs(deviceRef, 'maintenanceOrders'),
  ]);
  await deleteDoc(deviceRef);
};
