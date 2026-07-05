import { HttpPaymentRemoteDataSource } from './remote/http-payment-remote-data-source'
import { PaymentManagementRepositoryImpl } from './repositories/payment-management-repository-impl'

const paymentRemoteDataSource = new HttpPaymentRemoteDataSource()
const paymentRepository = new PaymentManagementRepositoryImpl(paymentRemoteDataSource)

export const financeServiceLocator = {
  listPaymentsUseCase: {
    execute: (input: Parameters<typeof paymentRepository.listPayments>[0]) =>
      paymentRepository.listPayments(input),
  },
  createPaymentUseCase: {
    execute: (input: Parameters<typeof paymentRepository.createPayment>[0]) =>
      paymentRepository.createPayment(input),
  },
}
