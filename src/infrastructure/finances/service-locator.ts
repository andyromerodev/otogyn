import { HttpPaymentRemoteDataSource } from './remote/http-payment-remote-data-source'
import { PaymentManagementRepositoryImpl } from './repositories/payment-management-repository-impl'
import { HttpExpenseRemoteDataSource } from './remote/http-expense-remote-data-source'
import { ExpenseManagementRepositoryImpl } from './repositories/expense-management-repository-impl'

const paymentRemoteDataSource = new HttpPaymentRemoteDataSource()
const paymentRepository = new PaymentManagementRepositoryImpl(paymentRemoteDataSource)

const expenseRemoteDataSource = new HttpExpenseRemoteDataSource()
const expenseRepository = new ExpenseManagementRepositoryImpl(expenseRemoteDataSource)

export const financeServiceLocator = {
  listPaymentsUseCase: {
    execute: (input: Parameters<typeof paymentRepository.listPayments>[0]) =>
      paymentRepository.listPayments(input),
  },
  createPaymentUseCase: {
    execute: (input: Parameters<typeof paymentRepository.createPayment>[0]) =>
      paymentRepository.createPayment(input),
  },
  listExpensesUseCase: {
    execute: (input: Parameters<typeof expenseRepository.listExpenses>[0]) =>
      expenseRepository.listExpenses(input),
  },
  createExpenseUseCase: {
    execute: (input: Parameters<typeof expenseRepository.createExpense>[0]) =>
      expenseRepository.createExpense(input),
  },
  listCategoriesUseCase: {
    execute: (options?: { includeInactive?: boolean }) =>
      expenseRepository.listCategories(options),
  },
  createCategoryUseCase: {
    execute: (input: Parameters<typeof expenseRepository.createCategory>[0]) =>
      expenseRepository.createCategory(input),
  },
  updateCategoryUseCase: {
    execute: (
      id: Parameters<typeof expenseRepository.updateCategory>[0],
      input: Parameters<typeof expenseRepository.updateCategory>[1],
    ) => expenseRepository.updateCategory(id, input),
  },
}
