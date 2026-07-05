import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { PaymentRepository } from '../../../domain/repositories/payment-repository'

export interface DeletePaymentInput {
  paymentId: string
  organizationId: string
}

export class DeletePaymentUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(input: DeletePaymentInput): Promise<void> {
    const existing = await this.paymentRepository.findById(input.paymentId)

    if (!existing || existing.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Pago no encontrado.')
    }

    await this.paymentRepository.delete(input.paymentId)
  }
}
