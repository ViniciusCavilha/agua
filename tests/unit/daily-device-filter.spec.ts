import { describe, expect, test } from 'vitest'
import { getConsumptionReadings, getConsumptionReadingsFromData } from '@/services/reading-service.js'

const todayAt = (hour: number) => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

describe('filtro diário por dispositivo', () => {
  test('consolida todos os dispositivos e isola o dispositivo selecionado', () => {
    const readings = [
      { id: 'a-1', deviceId: 'device-a', liters: 100, flowRate: 4, timestamp: todayAt(9), source: 'hardware' },
      { id: 'a-2', deviceId: 'device-a', liters: 50, flowRate: 2, timestamp: todayAt(10), source: 'hardware' },
      { id: 'b-1', deviceId: 'device-b', liters: 200, flowRate: 6, timestamp: todayAt(11), source: 'hardware' },
    ]
    const settings = { presentationMode: false, measurementUnit: 'Litros' }

    const overview = getConsumptionReadingsFromData(readings, settings)
    const deviceA = getConsumptionReadingsFromData(
      readings.filter((reading) => reading.deviceId === 'device-a'),
      settings,
    )

    expect(overview.dailyHourlyBars.reduce((total, bar) => total + bar.liters, 0)).toBe(350)
    expect(deviceA.dailyHourlyBars.reduce((total, bar) => total + bar.liters, 0)).toBe(150)
    expect(deviceA.rawReadings.every((reading) => reading.deviceId === 'device-a')).toBe(true)
  })

  test('preserva valores simulados diferentes ao filtrar cada dispositivo', () => {
    const settings = {
      anomalyDemo: false,
      measurementUnit: 'Litros',
      presentationMode: true,
      readingInterval: 10,
      simulationMode: true,
    }
    const devices = [
      { id: 'device-a', deviceCode: 'A', status: 'Ativo', sensor: { calibrationFactor: 7.5 } },
      { id: 'device-b', deviceCode: 'B', status: 'Ativo', sensor: { calibrationFactor: 7.5 } },
    ]
    const overview = getConsumptionReadings(settings, devices)
    const deviceA = getConsumptionReadingsFromData(
      overview.rawReadings.filter((reading) => reading.deviceId === 'device-a'),
      settings,
      { presentationProfile: true },
    )
    const deviceB = getConsumptionReadingsFromData(
      overview.rawReadings.filter((reading) => reading.deviceId === 'device-b'),
      settings,
      { presentationProfile: true },
    )
    const totalA = deviceA.rawReadings.reduce((total, reading) => total + reading.liters, 0)
    const totalB = deviceB.rawReadings.reduce((total, reading) => total + reading.liters, 0)
    const chartTotalA = deviceA.dailyHourlyBars.reduce((total, bar) => total + bar.liters, 0)
    const chartTotalB = deviceB.dailyHourlyBars.reduce((total, bar) => total + bar.liters, 0)

    expect(totalA).not.toBe(totalB)
    expect(chartTotalA).not.toBe(chartTotalB)
  })
})
