import { describe, expect, test } from 'vitest'
import { getConsumptionReadingsFromData } from '@/services/reading-service.js'

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
})
