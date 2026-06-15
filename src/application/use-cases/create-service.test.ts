import { describe, expect, it } from 'vitest'
import { CreateServiceUseCase } from './create-service'
import { MockServiceRepository } from '../../infrastructure/mock/mock-service-repository'

describe('CreateServiceUseCase', () => {
  it('creates a service when the duration is valid', async () => {
    const repository = new MockServiceRepository([])
    const useCase = new CreateServiceUseCase(repository)

    const service = await useCase.execute({
      organizationId: 'org_otogyn_demo',
      name: 'Consulta ORL',
      description: 'Servicio de prueba',
      defaultDurationMinutes: 30,
      price: 150,
      isActive: true,
    })

    expect(service.organizationId).toBe('org_otogyn_demo')
    expect(service.defaultDurationMinutes).toBe(30)
    expect(service.isActive).toBe(true)
  })

  it('rejects services with non-positive duration', async () => {
    const repository = new MockServiceRepository([])
    const useCase = new CreateServiceUseCase(repository)

    await expect(
      useCase.execute({
        organizationId: 'org_otogyn_demo',
        name: 'Consulta ORL',
        defaultDurationMinutes: 0,
      }),
    ).rejects.toThrow('Service duration must be greater than zero.')
  })
})
