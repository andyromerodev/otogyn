import type {
  CreateExpenseClientInput,
  ExpenseCategoryClientInput,
  ExpenseManagementRepository,
  ListExpensesClientInput,
} from '../../../application/ports/expense-management-repository'
import type { ExpenseListPageResult } from '../../../domain/repositories/expense-repository'
import type { ExpenseCategory } from '../../../domain/entities/expense-category'
import type { HttpExpenseRemoteDataSource } from '../remote/http-expense-remote-data-source'

export class ExpenseManagementRepositoryImpl implements ExpenseManagementRepository {
  constructor(private readonly remoteDataSource: HttpExpenseRemoteDataSource) {}

  listExpenses(input: ListExpensesClientInput): Promise<ExpenseListPageResult> {
    return this.remoteDataSource.listExpenses(input)
  }

  createExpense(input: CreateExpenseClientInput): Promise<void> {
    return this.remoteDataSource.createExpense(input)
  }

  listCategories(options?: { includeInactive?: boolean }): Promise<ExpenseCategory[]> {
    return this.remoteDataSource.listCategories(options)
  }

  createCategory(input: ExpenseCategoryClientInput): Promise<ExpenseCategory> {
    return this.remoteDataSource.createCategory(input)
  }

  updateCategory(
    id: string,
    input: Partial<ExpenseCategoryClientInput> & { isActive?: boolean },
  ): Promise<ExpenseCategory> {
    return this.remoteDataSource.updateCategory(id, input)
  }
}
