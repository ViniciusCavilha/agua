import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const authState = vi.hoisted(() => ({
  callback: null as ((user: { uid: string } | null) => void) | null,
  user: { uid: 'account-old' } as { uid: string } | null,
}))

const deviceState = vi.hoisted(() => ({
  listDevices: vi.fn(),
}))

vi.mock('@ionic/vue', () => ({
  IonContent: { template: '<div><slot /></div>' },
  IonIcon: { template: '<i><slot /></i>' },
  IonPage: { template: '<div><slot /></div>' },
  onIonViewWillEnter: (callback: () => void) => callback(),
}))

vi.mock('@/components/AppShell.vue', () => ({
  default: { template: '<main><slot /></main>' },
}))

vi.mock('@/data/account-store.js', () => ({
  getAccount: () => ({ unit: '' }),
}))

vi.mock('@/data/settings-store.js', () => ({
  getSettings: () => ({ simulationMode: false }),
}))

vi.mock('@/services/firebase.js', () => ({
  getCurrentUser: () => authState.user,
  watchAuthUser: (callback: (user: { uid: string } | null) => void) => {
    authState.callback = callback
    callback(authState.user)
    return vi.fn()
  },
}))

vi.mock('@/services/device-service.js', () => ({
  createSimulatedDevice: vi.fn(),
  DEVICE_STATUSES: [],
  SENSOR_MODELS: [],
  linkDeviceByCode: vi.fn(),
  listDevices: deviceState.listDevices,
  removeDevice: vi.fn(),
  updateDevice: vi.fn(),
  updateDeviceStatus: vi.fn(),
}))

vi.mock('@/services/reading-service.js', () => ({
  getConsumptionReadings: () => ({ rawReadings: [] }),
}))

vi.mock('@/services/technical-alert-service.js', () => ({
  generateTechnicalAlerts: () => [],
  syncTechnicalAlertNotifications: vi.fn(),
}))

import DevicesPage from '@/views/DevicesPage.vue'

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve
  })
  return { promise, resolve }
}

describe('isolamento de dispositivos entre contas', () => {
  beforeEach(() => {
    authState.user = { uid: 'account-old' }
    authState.callback = null
    deviceState.listDevices.mockReset()
  })

  test('ignora a lista atrasada da conta anterior depois da troca de usuário', async () => {
    const oldAccountRequest = deferred<Array<{ id: string; name: string }>>()
    const newAccountRequest = deferred<Array<{ id: string; name: string }>>()

    deviceState.listDevices
      .mockReturnValueOnce(oldAccountRequest.promise)
      .mockReturnValueOnce(newAccountRequest.promise)

    const wrapper = mount(DevicesPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    authState.user = { uid: 'account-new' }
    authState.callback?.(authState.user)
    await flushPromises()

    expect(wrapper.vm.devices).toEqual([])

    newAccountRequest.resolve([])
    await flushPromises()
    oldAccountRequest.resolve([{ id: 'old-device', name: 'Dispositivo da conta antiga' }])
    await flushPromises()

    expect(deviceState.listDevices).toHaveBeenCalledTimes(2)
    expect(wrapper.vm.devices).toEqual([])

    wrapper.unmount()
  })
})
