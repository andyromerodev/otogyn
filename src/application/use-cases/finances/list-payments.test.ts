import { describe, expect, it, vi } from 'vitest'
import type { PaymentRepository } from '../../../domain/repositories/payment-repository'
import { ListPaymentsUseCase } from './list-payments'

const makeRepository = () => ({
  listPage: vi.fn().mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  }),
}) as unknown as PaymentRepository & {
  listPage: ReturnType<typeof vi.fn>
}

describe('ListPaymentsUseCase', () => {
  it('lists payments with default pagination', async () => {
    const repository = makeRepository()
    const useCase = new ListPaymentsUseCase(repository)

    await useCase.execute({ organizationId: 'org_1' })

    expect(repository.listPage).toHaveBeenCalledWith({
      organizationId: 'org_1',
      page: 1,
      pageSize: 10,
      patientId: undefined,
      method: undefined,
      paidAtFrom: undefined,
      paidAtTo: undefined,
    })
  })

  it('passes filters and pagination through to the repository', async () => {
    const repository = makeRepository()
    const useCase = new ListPaymentsUseCase(repository)
    const paidAtFrom = new Date('2026-07-01T05:00:00.000Z')
    const paidAtTo = new Date('2026-08-01T05:00:00.000Z')

    await useCase.execute({
      organizationId: 'org_1',
      patientId: 'patient_1',
      method: 'tarjeta',
      paidAtFrom,
      paidAtTo,
      page: 3,
      pageSize: 25,
    })

    expect(repository.listPage).toHaveBeenCalledWith({
      organizationId: 'org_1',
      page: 3,
      pageSize: 25,
      patientId: 'patient_1',
      method: 'tarjeta',
      paidAtFrom,
      paidAtTo,
    })
  })
})
