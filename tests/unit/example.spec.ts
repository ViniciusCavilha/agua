import { beforeEach, describe, expect, test } from 'vitest'
import { applyTheme, getSavedTheme, resolveAccountTheme } from '@/data/theme-store.js'

describe('theme-store', () => {
  beforeEach(() => {
    localStorage.clear()
    delete document.documentElement.dataset.theme
    delete document.body.dataset.theme
  })

  test('persists and applies the dark theme', () => {
    expect(applyTheme('dark')).toBe('dark')
    expect(getSavedTheme()).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.body.dataset.theme).toBe('dark')
  })

  test('uses the light theme for an invalid preference', () => {
    localStorage.setItem('agua-plus-theme', 'invalid')
    expect(getSavedTheme()).toBe('light')
  })

  test('preserves a legacy dark preference from either account source', () => {
    expect(resolveAccountTheme({ remoteTheme: 'dark', localTheme: 'light' })).toBe('dark')
    expect(resolveAccountTheme({ remoteTheme: 'light', localTheme: 'dark' })).toBe('dark')
  })

  test('respects an explicitly configured account theme', () => {
    applyTheme('dark')
    expect(resolveAccountTheme({ remoteTheme: 'light', themeConfigured: true, localTheme: 'dark' })).toBe('light')
  })
})
