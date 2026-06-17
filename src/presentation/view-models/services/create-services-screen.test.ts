import { describe, expect, it, vi } from 'vitest'
import { createServicesScreen } from './create-services-screen'

const makeService = (overrides: Partial<{ id: string; name: string; isActive: boolean; price: number | null }> = {}) => ({
  id: overrides.id ?? 'service_1',
  organizationId: 'org_1',
  name: overrides.name ?? 'Consulta ORL',
  description: null,
  defaultDurationMinutes: 30,
  price: overrides.price ?? 120,
  isActive: overrides.isActive ?? true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const makeServiceDeps = (overrides: Record<string, unknown> = {}) => ({
  listServicesUseCase: {
    execute: vi.fn().mockResolvedValue([makeService()]),
  },
  createServiceUseCase: {
    execute: vi.fn(),
  },
  updateServiceUseCase: {
    execute: vi.fn(),
  },
  getServiceScreenContextUseCase: {
    execute: vi.fn().mockResolvedValue({
      userId: 'user_1',
      organizationId: 'org_1',
      role: 'admin_doctor',
    }),
  },
  ...overrides,
})

describe('createServicesScreen', () => {
  it('loads services and screen context through the use cases', async () => {
    const screen = createServicesScreen(makeServiceDeps())

    await screen.loadScreenContext()
    await screen.loadServices()

    expect(screen.canCreateServices.value).toBe(true)
    expect(screen.services.value).toHaveLength(1)
  })

  it('submits a service and reloads the list', async () => {
    const listServicesUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([makeService()]),
    }

    const createServiceUseCase = {
      execute: vi.fn().mockResolvedValue(makeService()),
    }

    const screen = createServicesScreen(
      makeServiceDeps({
        listServicesUseCase,
        createServiceUseCase,
      }),
    )

    await screen.loadServices()
    screen.form.name = 'Consulta ORL'
    screen.form.defaultDurationMinutes = 30
    screen.form.price = '120'

    await screen.submitService()

    expect(createServiceUseCase.execute).toHaveBeenCalledWith({
      name: 'Consulta ORL',
      description: null,
      defaultDurationMinutes: 30,
      price: 120,
      isActive: true,
    })
    expect(screen.successMessage.value).toBe('Servicio registrado correctamente.')
    expect(screen.services.value).toHaveLength(1)
  })

  it('updates a service through the edit form and reloads the list', async () => {
    const listServicesUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([makeService()])
        .mockResolvedValueOnce([makeService({ name: 'Consulta ORL extendida', price: 180 })]),
    }

    const updateServiceUseCase = {
      execute: vi.fn().mockResolvedValue(makeService({ name: 'Consulta ORL extendida', price: 180 })),
    }

    const screen = createServicesScreen(
      makeServiceDeps({
        listServicesUseCase,
        updateServiceUseCase,
      }),
    )

    await screen.loadServices()
    screen.startEditingService(screen.services.value[0]!)
    screen.editForm.name = 'Consulta ORL extendida'
    screen.editForm.price = '180'

    await screen.submitServiceUpdate()

    expect(updateServiceUseCase.execute).toHaveBeenCalledWith({
      id: 'service_1',
      name: 'Consulta ORL extendida',
      description: null,
      defaultDurationMinutes: 30,
      price: 180,
      isActive: true,
    })
    expect(screen.successMessage.value).toBe('Servicio actualizado correctamente.')
    expect(screen.editingServiceId.value).toBeNull()
    expect(screen.services.value[0]?.name).toBe('Consulta ORL extendida')
  })

  it('toggles a service from active to inactive', async () => {
    const listServicesUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([makeService({ isActive: true })])
        .mockResolvedValueOnce([makeService({ isActive: false })]),
    }

    const updateServiceUseCase = {
      execute: vi.fn().mockResolvedValue(makeService({ isActive: false })),
    }

    const screen = createServicesScreen(
      makeServiceDeps({
        listServicesUseCase,
        updateServiceUseCase,
      }),
    )

    await screen.loadServices()
    await screen.toggleServiceActive('service_1')

    expect(updateServiceUseCase.execute).toHaveBeenCalledWith({
      id: 'service_1',
      isActive: false,
    })
    expect(screen.successMessage.value).toBe('Servicio desactivado correctamente.')
    expect(screen.togglingServiceId.value).toBeNull()
    expect(screen.services.value[0]?.isActive).toBe(false)
  })

  it('toggles a service from inactive to active', async () => {
    const listServicesUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([makeService({ isActive: false })])
        .mockResolvedValueOnce([makeService({ isActive: true })]),
    }

    const updateServiceUseCase = {
      execute: vi.fn().mockResolvedValue(makeService({ isActive: true })),
    }

    const screen = createServicesScreen(
      makeServiceDeps({
        listServicesUseCase,
        updateServiceUseCase,
      }),
    )

    await screen.loadServices()
    await screen.toggleServiceActive('service_1')

    expect(updateServiceUseCase.execute).toHaveBeenCalledWith({
      id: 'service_1',
      isActive: true,
    })
    expect(screen.successMessage.value).toBe('Servicio activado correctamente.')
    expect(screen.services.value[0]?.isActive).toBe(true)
  })
})
