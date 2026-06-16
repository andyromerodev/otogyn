import { describe, expect, it, vi } from 'vitest'
import { createServicesScreen } from './create-services-screen'

describe('createServicesScreen', () => {
  it('loads services and screen context through the use cases', async () => {
    const screen = createServicesScreen({
      listServicesUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'service_1',
            organizationId: 'org_1',
            name: 'Consulta ORL',
            description: null,
            defaultDurationMinutes: 30,
            price: 120,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      },
      createServiceUseCase: {
        execute: vi.fn(),
      },
      getServiceScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

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
        .mockResolvedValueOnce([
          {
            id: 'service_1',
            organizationId: 'org_1',
            name: 'Consulta ORL',
            description: null,
            defaultDurationMinutes: 30,
            price: 120,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
    }

    const createServiceUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'service_1',
        organizationId: 'org_1',
        name: 'Consulta ORL',
        description: null,
        defaultDurationMinutes: 30,
        price: 120,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }

    const screen = createServicesScreen({
      listServicesUseCase,
      createServiceUseCase,
      getServiceScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

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
})
