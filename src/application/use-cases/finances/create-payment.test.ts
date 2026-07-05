import { describe, expect, it, vi } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { PaymentRepository } from '../../../domain/repositories/payment-repository'
import { CreatePaymentUseCase } from './create-payment'

const makeRepository = () => ({
  create: vi.fn().mockImplementation(async (payment) => payment),
}) as unknown as PaymentRepository & {
  create: ReturnType<typeof vi.fn>
}

const baseInput = {
  organizationId: 'org_1',
  createdBy: 'user_1',
  amount: 350,
  method: 'efectivo' as const,
  concept: 'Consulta general',
  paidAt: new Date('2026-07-05T15:00:00.000Z'),
}

describe('CreatePaymentUseCase', () => {
  it('creates a payment with defaults for optional links', async () => {
    const repository = makeRepository()
    const useCase = new CreatePaymentUseCase(repository)

    const payment = await useCase.execute(baseInput)

    expect(repository.create).toHaveBeenCalledTimes(1)
    expect(payment.organizationId).toBe('org_1')
    expect(payment.patientId).toBeNull()
    expect(payment.appointmentId).toBeNull()
    expect(payment.consultationId).toBeNull()
    expect(payment.notes).toBeNull()
    expect(payment.amount).toBe(350)
    expect(payment.method).toBe('efectivo')
    expect(payment.id).toMatch(/[0-9a-f-]{36}/)
  })

  it('trims the concept before saving', async () => {
    const repository = makeRepository()
    const useCase = new CreatePaymentUseCase(repository)

    const payment = await useCase.execute({ ...baseInput, concept: '  Consulta  ' })

    expect(payment.concept).toBe('Consulta')
  })

  it('rejects a non-positive amount', async () => {
    const repository = makeRepository()
    const useCase = new CreatePaymentUseCase(repository)

    await expect(useCase.execute({ ...baseInput, amount: 0 })).rejects.toThrow(BusinessRuleError)
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('rejects an empty concept', async () => {
    const repository = makeRepository()
    const useCase = new CreatePaymentUseCase(repository)

    await expect(useCase.execute({ ...baseInput, concept: '   ' })).rejects.toThrow(
      BusinessRuleError,
    )
    expect(repository.create).not.toHaveBeenCalled()
  })
})
