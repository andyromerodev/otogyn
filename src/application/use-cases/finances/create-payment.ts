import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Payment } from '../../../domain/entities/payment'
import type { PaymentRepository } from '../../../domain/repositories/payment-repository'
import type { PaymentMutationInput } from '../../dto/payment'

export interface CreatePaymentInput extends PaymentMutationInput {
  organizationId: string
  createdBy: string
}

export class CreatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(input: CreatePaymentInput): Promise<Payment> {
    if (input.amount <= 0) {
      throw new BusinessRuleError('El monto del pago debe ser mayor a cero.')
    }

    const concept = input.concept.trim()

    if (!concept) {
      throw new BusinessRuleError('El concepto del pago es obligatorio.')
    }

    const now = new Date()

    return this.paymentRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      patientId: input.patientId ?? null,
      appointmentId: input.appointmentId ?? null,
      consultationId: input.consultationId ?? null,
      amount: input.amount,
      method: input.method,
      concept,
      paidAt: input.paidAt,
      notes: input.notes ?? null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    })
  }
}
