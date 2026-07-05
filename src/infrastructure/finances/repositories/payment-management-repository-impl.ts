import type {
  CreatePaymentClientInput,
  ListPaymentsClientInput,
  PaymentManagementRepository,
} from '../../../application/ports/payment-management-repository'
import type { PaymentListPageResult } from '../../../domain/repositories/payment-repository'
import type { HttpPaymentRemoteDataSource } from '../remote/http-payment-remote-data-source'

export class PaymentManagementRepositoryImpl implements PaymentManagementRepository {
  constructor(private readonly remoteDataSource: HttpPaymentRemoteDataSource) {}

  listPayments(input: ListPaymentsClientInput): Promise<PaymentListPageResult> {
    return this.remoteDataSource.listPayments(input)
  }

  createPayment(input: CreatePaymentClientInput): Promise<void> {
    return this.remoteDataSource.createPayment(input)
  }
}
