import { beforeEach, describe, expect, test } from 'vitest'
import { clearActiveAccount, saveAccount } from '@/data/account-store.js'
import { addGoal, userGoals } from '@/data/goals-store.js'
import { addNotification, getNotifications } from '@/data/notifications-store.js'

describe('isolamento dos dados locais entre contas', () => {
  beforeEach(() => {
    localStorage.clear()
    clearActiveAccount()
  })

  test('mantém metas e notificações separadas por usuário', () => {
    saveAccount({ uid: 'user-a', email: 'a@example.com' })
    addGoal({ area: 'Cozinha', target: '10%' })
    addNotification({ id: 'alert-a', title: 'Alerta A', message: 'Somente da conta A' })

    expect(userGoals.value).toHaveLength(1)
    expect(getNotifications().map((item) => item.id)).toEqual(['alert-a'])

    saveAccount({ uid: 'user-b', email: 'b@example.com' })

    expect(userGoals.value).toEqual([])
    expect(getNotifications()).toEqual([])

    addGoal({ area: 'Laboratório', target: '15%' })
    addNotification({ id: 'alert-b', title: 'Alerta B', message: 'Somente da conta B' })

    saveAccount({ uid: 'user-a', email: 'a@example.com' })

    expect(userGoals.value).toHaveLength(1)
    expect(userGoals.value[0].title).toContain('Cozinha')
    expect(getNotifications().map((item) => item.id)).toEqual(['alert-a'])
  })
})
