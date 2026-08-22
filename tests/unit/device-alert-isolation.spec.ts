import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('@/services/firebase.js', () => ({
  getCurrentUser: () => null,
  getFirestoreDb: () => null,
  isFirebaseReady: () => false,
  waitForCurrentUser: async () => null,
}))

import { getNotificationRoute, getNotifications } from '@/data/notifications-store.js'
import {
  createSimulatedDevice,
  listDevices,
  updateDeviceStatus,
} from '@/services/device-service.js'
import {
  generateTechnicalAlerts,
  syncTechnicalAlertNotifications,
} from '@/services/technical-alert-service.js'

const settings = {
  simulationMode: true,
  anomalyDemo: true,
}

const prepareDevices = async () => {
  const deviceA = await createSimulatedDevice('Unidade A')
  const deviceB = await createSimulatedDevice('Unidade B')
  const deviceC = await createSimulatedDevice('Unidade C')

  await updateDeviceStatus(deviceA.id, 'Ativo')
  await updateDeviceStatus(deviceB.id, 'Manutenção')
  await updateDeviceStatus(deviceC.id, 'Offline')

  const devices = await listDevices()
  return {
    deviceA: devices.find((device) => device.id === deviceA.id)!,
    deviceB: devices.find((device) => device.id === deviceB.id)!,
    deviceC: devices.find((device) => device.id === deviceC.id)!,
    devices,
  }
}

describe('isolamento de alertas por dispositivo', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('1. manutenção aponta somente para o Device B', async () => {
    const { deviceB, devices } = await prepareDevices()
    const alert = generateTechnicalAlerts({ devices, settings }).find((item) => item.type === 'device-maintenance')!

    syncTechnicalAlertNotifications([alert])
    const notification = getNotifications()[0]

    expect(alert.deviceId).toBe(deviceB.id)
    expect(notification.deviceId).toBe(deviceB.id)
    expect(getNotificationRoute(notification)).toBe(`/dispositivos/${deviceB.id}`)
  })

  test('2. offline aponta somente para o Device C', async () => {
    const { deviceC, devices } = await prepareDevices()
    const alert = generateTechnicalAlerts({ devices, settings }).find((item) => item.type === 'device-offline')!

    syncTechnicalAlertNotifications([alert])
    const notification = getNotifications()[0]

    expect(alert.deviceId).toBe(deviceC.id)
    expect(getNotificationRoute(notification)).toBe(`/dispositivos/${deviceC.id}`)
  })

  test('3. Device A continua ativo sem herdar estados', async () => {
    const { deviceA, deviceB, deviceC } = await prepareDevices()

    expect(deviceA.status).toBe('Ativo')
    expect(deviceB.status).toBe('Manutenção')
    expect(deviceC.status).toBe('Offline')
    expect(new Set([deviceA.id, deviceB.id, deviceC.id]).size).toBe(3)
    expect(new Set([deviceA.deviceCode, deviceB.deviceCode, deviceC.deviceCode]).size).toBe(3)
  })

  test('4. vazamento no Device A não afeta os demais', async () => {
    const { deviceA, deviceB, deviceC, devices } = await prepareDevices()
    const reading = {
      id: 'reading-a',
      deviceId: deviceA.id,
      deviceCode: deviceA.deviceCode,
      status: 'anomaly',
      flowRate: 18,
      liters: 700,
      timestamp: new Date().toISOString(),
    }
    const leakAlerts = generateTechnicalAlerts({ devices, readings: [reading], settings })
      .filter((alert) => ['consumption-anomaly', 'possible-leak'].includes(alert.type))

    expect(leakAlerts.length).toBe(2)
    expect(leakAlerts.every((alert) => alert.deviceId === deviceA.id)).toBe(true)
    expect(leakAlerts.some((alert) => alert.deviceId === deviceB.id || alert.deviceId === deviceC.id)).toBe(false)
  })

  test('5. eventos simultâneos mantêm três destinos independentes', async () => {
    const { deviceA, deviceB, deviceC, devices } = await prepareDevices()
    const reading = {
      id: 'anomaly-a',
      deviceId: deviceA.id,
      deviceCode: deviceA.deviceCode,
      status: 'anomaly',
      flowRate: 10,
      liters: 300,
      timestamp: new Date().toISOString(),
    }
    const alerts = generateTechnicalAlerts({ devices, readings: [reading], settings })

    syncTechnicalAlertNotifications(alerts)
    const destinations = new Set(getNotifications().map((notification) => getNotificationRoute(notification)))

    expect(alerts).toHaveLength(3)
    expect(destinations).toEqual(new Set([
      `/dispositivos/${deviceA.id}`,
      `/dispositivos/${deviceB.id}`,
      `/dispositivos/${deviceC.id}`,
    ]))
  })

  test('6. atualizar Device B não altera Device A nem Device C', async () => {
    const { deviceA, deviceB, deviceC } = await prepareDevices()

    await updateDeviceStatus(deviceB.id, 'Ativo')
    const devices = await listDevices()

    expect(devices.find((device) => device.id === deviceA.id)?.status).toBe('Ativo')
    expect(devices.find((device) => device.id === deviceB.id)?.status).toBe('Ativo')
    expect(devices.find((device) => device.id === deviceC.id)?.status).toBe('Offline')
  })
})
