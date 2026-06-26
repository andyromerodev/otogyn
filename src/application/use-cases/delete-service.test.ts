import { describe, expect, it } from 'vitest'
import { DeleteServiceUseCase } from './delete-service'
import { MockServiceRepository } from '../../infrastructure/mock/mock-service-repository'

const makeService = (overrides: Partial<{ id: string; organizationId: string }> = {}) => ({
  id: overrides.id ?? 'svc_1',
  organizationId: overrides.organizationId ?? 'org_otogyn_demo',
  name: 'Consulta ORL',
  description: null,
  defaultDurationMinutes: 30,
  price: 120,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('DeleteServiceUseCase', () => {
  it('deletes the service when it belongs to the organization', async () => {
    const repository = new MockServiceRepository([makeService()])
    const useCase = new DeleteServiceUseCase(repository)

    await useCase.execute({
      serviceId: 'svc_1',
      organizationId: 'org_otogyn_demo',
    })

    await expect(repository.findById('svc_1')).resolves.toBeNull()
  })

  it('rejects deletion when the service belongs to another organization', async () => {
    const repository = new MockServiceRepository([makeService({ organizationId: 'org_other' })])
    const useCase = new DeleteServiceUseCase(repository)

    await expect(
      useCase.execute({
        serviceId: 'svc_1',
        organizationId: 'org_otogyn_demo',
      }),
    ).rejects.toThrow('Service not found.')
  })
})
