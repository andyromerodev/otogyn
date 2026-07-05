import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Payment } from '../../../domain/entities/payment'
import type { PaymentRepository } from '../../../domain/repositories/payment-repository'
import { UpdatePaymentUseCase } from './update-payment'

const existingPayment: Payment = {
  id: 'payment_1',
  organizationId: 'org_1',
  patientId: null,
  appointmentId: null,
  consultationId: null,
  amount: 350,
  method: 'efectivo',
  concept: 'Consulta general',
  paidAt: new Date('2026-07-05T15:00:00.000Z'),
  notes: null,
  createdBy: 'user_1',
  createdAt: new Date('2026-07-05T15:00:00.000Z'),
  updatedAt: new Date('2026-07-05T15:00:00.000Z'),
}

const makeRepository = (payment: Payment | null = existingPayment) => ({
  findById: vi.fn().mockResolvedValue(payment),
  update: vi.fn().mockImplementation(async (input) => ({ ...existingPayment, ...input })),
}) as unknown as PaymentRepository & {
  findById: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}

describe('UpdatePaymentUseCase', () => {
  it('updates an existing payment of the same organization', async () => {
    const repository = makeRepository()
    const useCase = new UpdatePaymentUseCase(repository)

    await useCase.execute({
      id: 'payment_1',
      organizationId: 'org_1',
      amount: 500,
      concept: ' Consulta de control ',
    })

    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'payment_1',
        amount: 500,
        concept: 'Consulta de control',
      }),
    )
  })

  it('rejects when the payment does not exist', async () => {
    const repository = makeRepository(null)
    const useCase = new UpdatePaymentUseCase(repository)

    await expect(
      useCase.execute({ id: 'missing', organizationId: 'org_1', amount: 500 }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('rejects when the payment belongs to another organization', async () => {
    const repository = makeRepository({ ...existingPayment, organizationId: 'org_2' })
    const useCase = new UpdatePaymentUseCase(repository)

    await expect(
      useCase.execute({ id: 'payment_1', organizationId: 'org_1', amount: 500 }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('rejects a non-positive amount', async () => {
    const repository = makeRepository()
    const useCase = new UpdatePaymentUseCase(repository)

    await expect(
      useCase.execute({ id: 'payment_1', organizationId: 'org_1', amount: -10 }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('rejects an empty concept', async () => {
    const repository = makeRepository()
    const useCase = new UpdatePaymentUseCase(repository)

    await expect(
      useCase.execute({ id: 'payment_1', organizationId: 'org_1', concept: '   ' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.update).not.toHaveBeenCalled()
  })
})
