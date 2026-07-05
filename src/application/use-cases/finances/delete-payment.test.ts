import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Payment } from '../../../domain/entities/payment'
import type { PaymentRepository } from '../../../domain/repositories/payment-repository'
import { DeletePaymentUseCase } from './delete-payment'

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
  delete: vi.fn().mockResolvedValue(undefined),
}) as unknown as PaymentRepository & {
  findById: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('DeletePaymentUseCase', () => {
  it('deletes an existing payment of the same organization', async () => {
    const repository = makeRepository()
    const useCase = new DeletePaymentUseCase(repository)

    await useCase.execute({ paymentId: 'payment_1', organizationId: 'org_1' })

    expect(repository.delete).toHaveBeenCalledWith('payment_1')
  })

  it('rejects when the payment does not exist', async () => {
    const repository = makeRepository(null)
    const useCase = new DeletePaymentUseCase(repository)

    await expect(
      useCase.execute({ paymentId: 'missing', organizationId: 'org_1' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.delete).not.toHaveBeenCalled()
  })

  it('rejects when the payment belongs to another organization', async () => {
    const repository = makeRepository({ ...existingPayment, organizationId: 'org_2' })
    const useCase = new DeletePaymentUseCase(repository)

    await expect(
      useCase.execute({ paymentId: 'payment_1', organizationId: 'org_1' }),
    ).rejects.toThrow(BusinessRuleError)
    expect(repository.delete).not.toHaveBeenCalled()
  })
})
