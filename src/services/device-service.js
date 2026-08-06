import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getCurrentUser, getFirestoreDb, isFirebaseReady } from './firebase.js';

const DEVICES_KEY = 'agua-plus-devices';

export const DEVICE_STATUSES = ['Aguardando conexao', 'Ativo', 'Offline', 'Manutencao'];
export const SENSOR_MODELS = ['YF-S201', 'YF-B1', 'Sensor Hall generico', 'Medidor com saida de pulso', 'Outro'];
export const SENSOR_TYPES = ['Fluxo de agua por pulso'];

const simulatedDevice = {
  name: 'ESP32 Protótipo',
  deviceCode: 'ESP32-FLOW-001',
  location: 'Bancada de testes',
  unit: '',
  status: 'Aguardando conexao',
  sensor: {
    name: 'YF-S201',
    sensorCode: 'FLOW-YF-S201-001',
    type: 'Fluxo de agua por pulso',
    calibrationFactor: 7.5,
  },
  readingInterval: 10,
  totalConsumption: 0,
  lastReadingLiters: 0,
  lastFlowRate: 0,
  lastPulseCount: 0,
  lastReadingAt: null,
};

const normalizeDevice = (device = {}) => ({
  id: device.id || `local-${Date.now()}`,
  name: device.name || '',
  deviceCode: device.deviceCode || '',
  location: device.location || '',
  unit: device.unit || '',
  status: device.status || 'Aguardando conexao',
  sensor: {
    name: device.sensor?.name || 'YF-S201',
    sensorCode: device.sensor?.sensorCode || '',
    type: device.sensor?.type || 'Fluxo de agua por pulso',
    calibrationFactor: Number(device.sensor?.calibrationFactor || 7.5),
  },
  readingInterval: Number(device.readingInterval || 10),
  totalConsumption: Number(device.totalConsumption || 0),
  lastReadingLiters: Number(device.lastReadingLiters || 0),
  lastFlowRate: Number(device.lastFlowRate || 0),
  lastPulseCount: Number(device.lastPulseCount || 0),
  lastReadingAt: device.lastReadingAt || null,
});

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

const getUserDevicesCollection = () => {
  const db = getFirestoreDb();
  const currentUser = getCurrentUser();

  if (!db || !currentUser) {
    return null;
  }

  return collection(db, 'users', currentUser.uid, 'devices');
};

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
  if (!isFirebaseReady() || !getCurrentUser()) {
    return getLocalDevices();
  }

  const devicesRef = getUserDevicesCollection();
  const snapshot = await getDocs(query(devicesRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => normalizeDevice({ ...item.data(), id: item.id }));
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

  if (!isFirebaseReady() || !getCurrentUser()) {
    const devices = saveLocalDevices([{ ...nextDevice, id: `local-${Date.now()}` }, ...getLocalDevices()]);
    return devices[0];
  }

  const devicesRef = getUserDevicesCollection();
  const { id, ...devicePayload } = nextDevice;
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
    liters: 0,
    flowRate: 0,
    pulseCount: 0,
    source: 'simulated',
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(devicesRef, created.id, 'alerts'), {
    type: 'device-waiting',
    title: 'Dispositivo aguardando conexao',
    message: 'Este dispositivo simulado esta pronto para receber leituras do ESP32 futuramente.',
    status: 'Aberto',
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(devicesRef, created.id, 'maintenanceOrders'), {
    title: 'Validar instalacao do sensor',
    description: 'Ordem simulada para registrar a futura verificacao fisica do sensor de vazao.',
    status: 'Planejada',
    createdAt: serverTimestamp(),
  });

  return { ...nextDevice, id: created.id };
};

export const createSimulatedDevice = (unit = '') => {
  return createDevice({
    ...simulatedDevice,
    unit,
  });
};

export const updateDeviceStatus = async (deviceId, status) => {
  if (!DEVICE_STATUSES.includes(status)) {
    return;
  }

  if (!isFirebaseReady() || !getCurrentUser()) {
    saveLocalDevices(getLocalDevices().map((device) => (device.id === deviceId ? { ...device, status } : device)));
    return;
  }

  const devicesRef = getUserDevicesCollection();
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
  const nextUpdates = normalizeDevice({
    ...updates,
    id: deviceId,
  });
  const { id, ...payload } = nextUpdates;

  if (!isFirebaseReady() || !getCurrentUser()) {
    saveLocalDevices(getLocalDevices().map((device) => (device.id === deviceId ? normalizeDevice({ ...device, ...updates }) : device)));
    return;
  }

  const devicesRef = getUserDevicesCollection();
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
  if (!isFirebaseReady() || !getCurrentUser()) {
    saveLocalDevices(getLocalDevices().filter((device) => device.id !== deviceId));
    return;
  }

  const devicesRef = getUserDevicesCollection();
  const deviceRef = doc(devicesRef, deviceId);

  await Promise.all([
    tryDeleteSubcollectionDocs(deviceRef, 'sensors'),
    tryDeleteSubcollectionDocs(deviceRef, 'readings'),
    tryDeleteSubcollectionDocs(deviceRef, 'alerts'),
    tryDeleteSubcollectionDocs(deviceRef, 'maintenanceOrders'),
  ]);
  await deleteDoc(deviceRef);
};
