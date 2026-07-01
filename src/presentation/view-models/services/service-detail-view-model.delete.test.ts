import { describe, expect, it, vi } from 'vitest'
import { createServiceDetailViewModel } from './service-detail-view-model'

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

describe('createServiceDetailViewModel delete flow', () => {
  it('opens and confirms delete successfully', async () => {
    const deleteServiceUseCase = { execute: vi.fn().mockResolvedValue(undefined) }
    const screen = createServiceDetailViewModel({
      serviceId: 'svc_1',
      getServiceDetailUseCase: { execute: vi.fn().mockResolvedValue(serviceFixture) },
      updateServiceUseCase: { execute: vi.fn() },
      deleteServiceUseCase,
      getServiceScreenContextUseCase: { execute: vi.fn() },
    })

    screen.requestDelete()
    expect(screen.isDeleteConfirmOpen.value).toBe(true)

    await screen.confirmDelete()

    expect(deleteServiceUseCase.execute).toHaveBeenCalledWith({ serviceId: 'svc_1' })
    expect(screen.deleted.value).toBe(true)
    expect(screen.isDeleteConfirmOpen.value).toBe(false)
  })

  it('keeps the detail screen open and surfaces delete errors', async () => {
    const screen = createServiceDetailViewModel({
      serviceId: 'svc_1',
      getServiceDetailUseCase: { execute: vi.fn().mockResolvedValue(serviceFixture) },
      updateServiceUseCase: { execute: vi.fn() },
      deleteServiceUseCase: {
        execute: vi.fn().mockRejectedValue({
          statusCode: 400,
          statusMessage: 'No se puede eliminar un servicio con citas asociadas.',
        }),
      },
      getServiceScreenContextUseCase: { execute: vi.fn() },
    })

    screen.requestDelete()
    await screen.confirmDelete()

    expect(screen.deleted.value).toBe(false)
    expect(screen.errorMessage.value).toBeNull()
    expect(screen.isDeleteConfirmOpen.value).toBe(false)
    expect(screen.isDeleteBlockedDialogOpen.value).toBe(true)
    expect(screen.deleteBlockedMessage.value).toBe('No se puede eliminar un servicio con citas asociadas.')
  })

  it('opens the blocked dialog when the API returns the message in error.data.message', async () => {
    const screen = createServiceDetailViewModel({
      serviceId: 'svc_1',
      getServiceDetailUseCase: { execute: vi.fn().mockResolvedValue(serviceFixture) },
      updateServiceUseCase: { execute: vi.fn() },
      deleteServiceUseCase: {
        execute: vi.fn().mockRejectedValue({
          statusCode: 400,
          data: {
            message: 'No se puede eliminar un servicio con citas asociadas.',
          },
        }),
      },
      getServiceScreenContextUseCase: { execute: vi.fn() },
    })

    screen.requestDelete()
    await screen.confirmDelete()

    expect(screen.deleted.value).toBe(false)
    expect(screen.errorMessage.value).toBeNull()
    expect(screen.isDeleteConfirmOpen.value).toBe(false)
    expect(screen.isDeleteBlockedDialogOpen.value).toBe(true)
    expect(screen.deleteBlockedMessage.value).toBe('No se puede eliminar un servicio con citas asociadas.')
  })
})
