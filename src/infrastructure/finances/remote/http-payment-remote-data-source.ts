import type {
  CreatePaymentClientInput,
  ListPaymentsClientInput,
  PaymentManagementRepository,
} from '../../../application/ports/payment-management-repository'
import type { PaymentListPageResult } from '../../../domain/repositories/payment-repository'

export class HttpPaymentRemoteDataSource implements PaymentManagementRepository {
  async listPayments(input: ListPaymentsClientInput): Promise<PaymentListPageResult> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (
        request: string,
        options?: Record<string, unknown>,
      ) => Promise<unknown>

      return (await requestFetch('/api/payments', {
        query: {
          patientId: input.patientId,
          method: input.method,
          paidAtFrom: input.paidAtFrom,
          paidAtTo: input.paidAtTo,
          page: input.page ?? 1,
          pageSize: input.pageSize ?? 10,
        },
      })) as PaymentListPageResult
    }

    return $fetch<PaymentListPageResult>('/api/payments', {
      query: {
        patientId: input.patientId,
        method: input.method,
        paidAtFrom: input.paidAtFrom,
        paidAtTo: input.paidAtTo,
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 10,
      },
    })
  }

  async createPayment(input: CreatePaymentClientInput): Promise<void> {
    await $fetch('/api/payments', {
      method: 'POST',
      body: input,
    })
  }
}
