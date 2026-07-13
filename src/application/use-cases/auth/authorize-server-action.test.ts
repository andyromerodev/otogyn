import { describe, expect, it } from 'vitest'
import { AuthorizeServerActionUseCase } from './authorize-server-action'

const admin = { userId: 'admin', organizationId: 'org', role: 'admin_doctor' as const }
const assistant = { userId: 'assistant', organizationId: 'org', role: 'assistant' as const }

describe('AuthorizeServerActionUseCase inventory permissions', () => {
  const useCase = new AuthorizeServerActionUseCase()

  it('permite lectura y operación a ambos roles', () => {
    for (const action of ['inventory:read', 'inventory:operate'] as const) {
      expect(useCase.canPerformAction(admin, action)).toBe(true)
      expect(useCase.canPerformAction(assistant, action)).toBe(true)
    }
  })

  it('reserva la administración para la doctora', () => {
    expect(useCase.canPerformAction(admin, 'inventory:manage')).toBe(true)
    expect(useCase.canPerformAction(assistant, 'inventory:manage')).toBe(false)
  })
})
