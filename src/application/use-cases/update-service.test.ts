import { describe, expect, it } from 'vitest'
import { UpdateServiceUseCase } from './update-service'
import { MockServiceRepository } from '../../infrastructure/mock/mock-service-repository'

const makeService = (overrides: Partial<{ id: string; name: string; isActive: boolean }> = {}) => ({
  id: overrides.id ?? 'svc_1',
  organizationId: 'org_otogyn_demo',
  name: overrides.name ?? 'Consulta ORL',
  description: null,
  defaultDurationMinutes: 30,
  price: 120,
  isActive: overrides.isActive ?? true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('UpdateServiceUseCase', () => {
  it('updates a service when it exists', async () => {
    const repository = new MockServiceRepository([makeService()])
    const useCase = new UpdateServiceUseCase(repository)

    const updated = await useCase.execute({
      id: 'svc_1',
      name: 'Consulta ORL extendida',
      defaultDurationMinutes: 45,
    })

    expect(updated.name).toBe('Consulta ORL extendida')
    expect(updated.defaultDurationMinutes).toBe(45)
    expect(updated.price).toBe(120)
    expect(updated.isActive).toBe(true)
  })

  it('rejects update when the service does not exist', async () => {
    const repository = new MockServiceRepository([])
    const useCase = new UpdateServiceUseCase(repository)

    await expect(
      useCase.execute({
        id: 'svc_missing',
        name: 'Nuevo nombre',
      }),
    ).rejects.toThrow('Service not found.')
  })

  it('rejects update when the provided duration is non-positive', async () => {
    const repository = new MockServiceRepository([makeService()])
    const useCase = new UpdateServiceUseCase(repository)

    await expect(
      useCase.execute({
        id: 'svc_1',
        defaultDurationMinutes: 0,
      }),
    ).rejects.toThrow('Service duration must be greater than zero.')
  })

  it('can deactivate a service by setting isActive to false', async () => {
    const repository = new MockServiceRepository([makeService({ isActive: true })])
    const useCase = new UpdateServiceUseCase(repository)

    const updated = await useCase.execute({
      id: 'svc_1',
      isActive: false,
    })

    expect(updated.isActive).toBe(false)
  })

  it('can reactivate a service by setting isActive to true', async () => {
    const repository = new MockServiceRepository([makeService({ isActive: false })])
    const useCase = new UpdateServiceUseCase(repository)

    const updated = await useCase.execute({
      id: 'svc_1',
      isActive: true,
    })

    expect(updated.isActive).toBe(true)
  })
})
