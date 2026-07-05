import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Payment } from '../../../domain/entities/payment'
import type { PaymentRepository } from '../../../domain/repositories/payment-repository'
import type { PaymentUpdateInput } from '../../dto/payment'

export interface UpdatePaymentUseCaseInput extends PaymentUpdateInput {
  organizationId: string
}

export class UpdatePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(input: UpdatePaymentUseCaseInput): Promise<Payment> {
    const existing = await this.paymentRepository.findById(input.id)

    if (!existing || existing.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Pago no encontrado.')
    }

    if (input.amount !== undefined && input.amount <= 0) {
      throw new BusinessRuleError('El monto del pago debe ser mayor a cero.')
    }

    const concept = input.concept?.trim()

    if (concept !== undefined && !concept) {
      throw new BusinessRuleError('El concepto del pago es obligatorio.')
    }

    return this.paymentRepository.update({
      id: input.id,
      patientId: input.patientId,
      appointmentId: input.appointmentId,
      consultationId: input.consultationId,
      amount: input.amount,
      method: input.method,
      concept,
      paidAt: input.paidAt,
      notes: input.notes,
    })
  }
}
