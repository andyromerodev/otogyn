import { describe, expect, it, vi } from 'vitest'
import { createServicesListViewModel } from './services-list-view-model'

const makeService = (overrides: Partial<{ id: string; name: string; isActive: boolean }> = {}) => ({
  id: overrides.id ?? 'svc_1',
  organizationId: 'org_1',
  name: overrides.name ?? 'Consulta ORL',
  description: null,
  defaultDurationMinutes: 30,
  price: 120,
  isActive: overrides.isActive ?? true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('createServicesListViewModel', () => {
  it('loads services through use case', async () => {
    const execute = vi.fn().mockResolvedValue([makeService(), makeService({ id: 'svc_2', name: 'Ecografia' })])
    const screen = createServicesListViewModel({
      listServicesUseCase: { execute },
      getServiceScreenContextUseCase: { execute: vi.fn() },
    })

    await screen.loadServices()

    expect(execute).toHaveBeenCalled()
    expect(screen.services.value).toHaveLength(2)
    expect(screen.totalLabel.value).toBe('2 servicios · ORL')
  })

  it('exposes canManageServices based on screen context role', async () => {
    const screen = createServicesListViewModel({
      listServicesUseCase: { execute: vi.fn().mockResolvedValue([]) },
      getServiceScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    await screen.loadScreenContext()

    expect(screen.canManageServices.value).toBe(true)
  })

  it('normalizes load error to a stable message', async () => {
    const execute = vi.fn().mockRejectedValue({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })

    const screen = createServicesListViewModel({
      listServicesUseCase: { execute },
      getServiceScreenContextUseCase: { execute: vi.fn() },
    })

    await screen.loadServices()

    expect(screen.errorMessage.value).toBe('Unauthorized')
  })
})
