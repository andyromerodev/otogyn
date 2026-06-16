import { describe, expect, it } from 'vitest'
import { ListServicesUseCase } from './list-services'
import { MockServiceRepository } from '../../infrastructure/mock/mock-service-repository'

describe('ListServicesUseCase', () => {
  it('returns only services from the requested organization', async () => {
    const repository = new MockServiceRepository([
      {
        id: 'service_1',
        organizationId: 'org_a',
        name: 'Consulta ORL',
        description: null,
        defaultDurationMinutes: 30,
        price: 120,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'service_2',
        organizationId: 'org_b',
        name: 'Audiometria',
        description: null,
        defaultDurationMinutes: 45,
        price: 150,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const useCase = new ListServicesUseCase(repository)

    const result = await useCase.execute({
      organizationId: 'org_a',
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('service_1')
  })
})
