import type { PaymentMethod } from '~~/src/domain/entities/payment'
import type { PaymentListPageResult } from '~~/src/domain/repositories/payment-repository'
import type { ListPaymentsClientInput } from '~~/src/application/ports/payment-management-repository'

export interface PaymentsListViewModelDependencies {
  listPaymentsUseCase: { execute(input: ListPaymentsClientInput): Promise<PaymentListPageResult> }
  initialMethod?: PaymentMethod | null
  initialPage?: number
  initialPageSize?: number
}
