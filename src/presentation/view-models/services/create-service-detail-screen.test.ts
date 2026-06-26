import { describe, expect, it, vi } from 'vitest'
import { createServiceDetailScreen } from './create-service-detail-screen'

const serviceFixture = {
  id: 'svc_1',
  organizationId: 'org_1',
  name: 'Consulta ORL',
  description: 'Consulta general',
  defaultDurationMinutes: 30,
  price: 150,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('createServiceDetailScreen', () => {
  it('loads the service detail into the form', async () => {
    const screen = createServiceDetailScreen({
      serviceId: 'svc_1',
      getServiceDetailUseCase: { execute: vi.fn().mockResolvedValue(serviceFixture) },
      updateServiceUseCase: { execute: vi.fn() },
      getServiceScreenContextUseCase: { execute: vi.fn() },
    })

    await screen.loadService()

    expect(screen.service.value?.id).toBe('svc_1')
    expect(screen.form.name).toBe('Consulta ORL')
    expect(screen.form.price).toBe('150')
  })

  it('updates the service and exits editing mode without a confirmation step', async () => {
    const updateServiceUseCase = {
      execute: vi.fn().mockResolvedValue({
        ...serviceFixture,
        name: 'Consulta ORL extendida',
        isActive: false,
      }),
    }

    const screen = createServiceDetailScreen({
      serviceId: 'svc_1',
      getServiceDetailUseCase: { execute: vi.fn().mockResolvedValue(serviceFixture) },
      updateServiceUseCase,
      getServiceScreenContextUseCase: { execute: vi.fn() },
    })

    await screen.loadService()
    screen.startEditing()
    screen.form.name = 'Consulta ORL extendida'
    screen.form.isActive = false

    await screen.submitService()

    expect(updateServiceUseCase.execute).toHaveBeenCalledWith({
      id: 'svc_1',
      name: 'Consulta ORL extendida',
      description: 'Consulta general',
      defaultDurationMinutes: 30,
      price: 150,
      isActive: false,
    })
    expect(screen.isEditing.value).toBe(false)
    expect(screen.successMessage.value).toBe('Servicio actualizado correctamente.')
  })

  it('normalizes load error to a stable message', async () => {
    const screen = createServiceDetailScreen({
      serviceId: 'svc_missing',
      getServiceDetailUseCase: {
        execute: vi.fn().mockRejectedValue({
          statusCode: 404,
          statusMessage: 'Service not found.',
        }),
      },
      updateServiceUseCase: { execute: vi.fn() },
      getServiceScreenContextUseCase: { execute: vi.fn() },
    })

    await screen.loadService()

    expect(screen.errorMessage.value).toBe('Service not found.')
  })
})
