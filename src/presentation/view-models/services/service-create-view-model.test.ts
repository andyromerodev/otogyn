import { describe, expect, it, vi } from 'vitest'
import { createServiceCreateViewModel } from './service-create-view-model'

describe('createServiceCreateViewModel', () => {
  it('submits a service and exposes a success message', async () => {
    const createServiceUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'svc_1',
        organizationId: 'org_1',
        name: 'Consulta ORL',
        description: null,
        defaultDurationMinutes: 30,
        price: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }

    const screen = createServiceCreateViewModel({ createServiceUseCase })

    screen.form.name = 'Consulta ORL'
    screen.form.defaultDurationMinutes = 30
    screen.form.price = '150'

    await screen.submitService()

    expect(createServiceUseCase.execute).toHaveBeenCalledWith({
      name: 'Consulta ORL',
      description: null,
      defaultDurationMinutes: 30,
      price: 150,
      isActive: true,
    })
    expect(screen.successMessage.value).toBe('Servicio registrado correctamente.')
    expect(screen.createdService.value?.id).toBe('svc_1')
  })

  it('exposes an error message when creation fails', async () => {
    const createServiceUseCase = {
      execute: vi.fn().mockRejectedValue({
        statusCode: 400,
        statusMessage: 'Validation failed.',
      }),
    }

    const screen = createServiceCreateViewModel({ createServiceUseCase })

    screen.form.name = 'Consulta ORL'

    await screen.submitService()

    expect(screen.errorMessage.value).toBe('Validation failed.')
    expect(screen.createdService.value).toBeNull()
  })
})
