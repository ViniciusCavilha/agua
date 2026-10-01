import { describe, expect, test } from 'vitest'
import { getMonthlyImpactSummary } from '@/services/reading-service.js'

describe('resumo mensal', () => {
  test('preenche os quatro indicadores quando o modo de simulação está ativo', () => {
    const summary = getMonthlyImpactSummary({
      settings: { simulationMode: true, presentationMode: true, anomalyDemo: false },
      devices: [],
    })

    expect(summary.simulated).toBe(true)
    expect(summary.consumptionLiters).toBeGreaterThan(0)
    expect(summary.savedLiters).toBeGreaterThan(0)
    expect(summary.savedAmount).toBeGreaterThan(0)
    expect(summary.treeEquivalent).toBeGreaterThan(0)
  })

  test('respeita os dispositivos offline na projeção', () => {
    const summary = getMonthlyImpactSummary({
      settings: { simulationMode: true, presentationMode: true, anomalyDemo: false },
      devices: [{ status: 'Offline' }],
    })

    expect(summary.consumptionLiters).toBe(0)
    expect(summary.savedLiters).toBe(0)
    expect(summary.savedAmount).toBe(0)
    expect(summary.treeEquivalent).toBe(0)
  })

  test('mantém os valores zerados com apenas o modo de simulação ligado', () => {
    const summary = getMonthlyImpactSummary({
      settings: { simulationMode: true, presentationMode: false },
      readings: [],
    })

    expect(summary).toEqual({
      consumptionLiters: 0,
      savedLiters: 0,
      savedAmount: 0,
      treeEquivalent: 0,
      goalTargetPercentage: 0,
      goalProgress: 0,
      hasRealData: false,
      simulated: false,
    })
  })

  test('calcula consumo, economia e progresso usando dados reais e metas', () => {
    const now = new Date()
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 15).toISOString()
    const summary = getMonthlyImpactSummary({
      settings: { simulationMode: true, presentationMode: false, waterTariffPerCubicMeter: 10 },
      goals: [{ target: 'Meta: 20% de redução' }],
      readings: [
        { liters: 10000, timestamp: previousMonth, source: 'esp32' },
        { liters: 8000, timestamp: currentMonth, source: 'esp32' },
        { liters: 99999, timestamp: currentMonth, source: 'simulated' },
      ],
    })

    expect(summary.consumptionLiters).toBe(8000)
    expect(summary.savedLiters).toBe(2000)
    expect(summary.savedAmount).toBe(20)
    expect(summary.treeEquivalent).toBe(2)
    expect(summary.goalTargetPercentage).toBe(20)
    expect(summary.goalProgress).toBe(100)
    expect(summary.hasRealData).toBe(true)
    expect(summary.simulated).toBe(false)
  })
})
