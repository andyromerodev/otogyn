import type {
  PaymentListPageResult,
  PaymentRepository,
} from '../../../domain/repositories/payment-repository'
import type { PaymentListQueryInput } from '../../dto/payment'

export interface ListPaymentsInput extends PaymentListQueryInput {
  organizationId: string
}

export class ListPaymentsUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  execute(input: ListPaymentsInput): Promise<PaymentListPageResult> {
    return this.paymentRepository.listPage({
      organizationId: input.organizationId,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
      patientId: input.patientId,
      method: input.method,
      paidAtFrom: input.paidAtFrom,
      paidAtTo: input.paidAtTo,
      search: input.search,
    })
  }
}
