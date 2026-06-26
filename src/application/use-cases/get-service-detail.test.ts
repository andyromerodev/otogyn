import { describe, expect, it } from 'vitest'
import { GetServiceDetailUseCase } from './get-service-detail'
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

describe('GetServiceDetailUseCase', () => {
  it('returns the service when it exists in the organization', async () => {
    const repository = new MockServiceRepository([makeService()])
    const useCase = new GetServiceDetailUseCase(repository)

    const service = await useCase.execute({
      serviceId: 'svc_1',
      organizationId: 'org_otogyn_demo',
    })

    expect(service?.id).toBe('svc_1')
  })

  it('returns null when the service does not exist', async () => {
    const repository = new MockServiceRepository([])
    const useCase = new GetServiceDetailUseCase(repository)

    const service = await useCase.execute({
      serviceId: 'svc_missing',
      organizationId: 'org_otogyn_demo',
    })

    expect(service).toBeNull()
  })

  it('returns null when the service belongs to another organization', async () => {
    const repository = new MockServiceRepository([makeService({ organizationId: 'org_other' })])
    const useCase = new GetServiceDetailUseCase(repository)

    const service = await useCase.execute({
      serviceId: 'svc_1',
      organizationId: 'org_otogyn_demo',
    })

    expect(service).toBeNull()
  })
})
