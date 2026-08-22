import { addNotification, removeNotificationsByPrefix } from '../data/notifications-store.js';

export const TECHNICAL_ALERT_TYPES = {
  DEVICE_OFFLINE: 'device-offline',
  DEVICE_WAITING: 'device-waiting',
  DEVICE_MAINTENANCE: 'device-maintenance',
  CONSUMPTION_ANOMALY: 'consumption-anomaly',
  POSSIBLE_LEAK: 'possible-leak',
};

const alertDefinitions = {
  [TECHNICAL_ALERT_TYPES.DEVICE_OFFLINE]: {
    severity: 'critical',
    title: 'Dispositivo offline',
    message: 'O monitor parou de se comunicar e precisa ser verificado.',
  },
  [TECHNICAL_ALERT_TYPES.DEVICE_WAITING]: {
    severity: 'warning',
    title: 'Dispositivo águardando conexão',
    message: 'O dispositivo está cadastrado, mas ainda não enviou leituras reais.',
  },
  [TECHNICAL_ALERT_TYPES.DEVICE_MAINTENANCE]: {
    severity: 'warning',
    title: 'Manutenção em andamento',
    message: 'Este ponto de medição foi marcado para manutenção.',
  },
  [TECHNICAL_ALERT_TYPES.CONSUMPTION_ANOMALY]: {
    severity: 'critical',
    title: 'Consumo fora do padrão',
    message: 'Uma leitura simulada indica consumo acima do esperado.',
  },
  [TECHNICAL_ALERT_TYPES.POSSIBLE_LEAK]: {
    severity: 'critical',
    title: 'Possível vazamento',
    message: 'Fluxo contínuo detectado em uma leitura de demonstração.',
  },
};

const buildAlert = ({ type, device = null, reading = null, message = '' }) => {
  const definition = alertDefinitions[type];
  const deviceCode = device?.deviceCode || reading?.deviceCode || '';
  const deviceName = device?.name || deviceCode || 'Monitor de água';

  return {
    id: `${type}-${device?.id || reading?.deviceId || deviceCode || 'simulated'}`,
    type,
    severity: definition.severity,
    title: definition.title,
    message: message || definition.message,
    status: 'Aberto',
    deviceId: device?.id || reading?.deviceId || '',
    deviceCode,
    sensorId: device?.sensor?.sensorCode || reading?.sensorId || '',
    readingId: reading?.id || '',
    source: reading?.source || 'simulated',
    deviceName,
    createdAt: reading?.timestamp || new Date().toISOString(),
  };
};

export const generateTechnicalAlerts = ({ devices = [], readings = [], settings = {} } = {}) => {
  const alerts = [];
  const canShowSimulatedAnomalies = settings.simulationMode && settings.anomalyDemo;

  devices.forEach((device) => {
    if (device.status === 'Offline') {
      alerts.push(buildAlert({ type: TECHNICAL_ALERT_TYPES.DEVICE_OFFLINE, device }));
    }

    if (device.status === 'Aguardando conexão') {
      alerts.push(buildAlert({ type: TECHNICAL_ALERT_TYPES.DEVICE_WAITING, device }));
    }

    if (device.status === 'Manutenção') {
      alerts.push(buildAlert({ type: TECHNICAL_ALERT_TYPES.DEVICE_MAINTENANCE, device }));
    }
  });

  readings.forEach((reading) => {
    if (canShowSimulatedAnomalies && reading.status === 'anomaly') {
      alerts.push(buildAlert({ type: TECHNICAL_ALERT_TYPES.CONSUMPTION_ANOMALY, reading }));
    }

    if (canShowSimulatedAnomalies && reading.flowRate >= 15 && reading.liters >= 500) {
      alerts.push(
        buildAlert({
          type: TECHNICAL_ALERT_TYPES.POSSIBLE_LEAK,
          reading,
          message: 'A simulação encontrou vazão alta com volume acumulado acima do limite.',
        }),
      );
    }
  });

  return alerts.sort((a, b) => {
    const priority = { critical: 0, warning: 1, info: 2 };
    return priority[a.severity] - priority[b.severity] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const syncTechnicalAlertNotifications = (alerts = []) => {
  removeNotificationsByPrefix('technical-');

  alerts.forEach((alert) => {
    addNotification({
      id: `technical-${alert.id}`,
      type: alert.severity === 'critical' ? 'warning' : 'info',
      title: alert.title,
      message: alert.deviceCode ? `${alert.deviceCode}: ${alert.message}` : alert.message,
      to: alert.deviceId ? `/dispositivos/${alert.deviceId}` : '/consumo',
    });
  });

  return alerts.map((alert) => `technical-${alert.id}`);
};
