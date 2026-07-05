import type { ExpenseListPageResult } from '~~/src/domain/repositories/expense-repository'
import type { ExpenseCategory } from '~~/src/domain/entities/expense-category'
import type { ListExpensesClientInput } from '~~/src/application/ports/expense-management-repository'

export interface ExpensesListViewModelDependencies {
  listExpensesUseCase: { execute(input: ListExpensesClientInput): Promise<ExpenseListPageResult> }
  listCategoriesUseCase: { execute(options?: { includeInactive?: boolean }): Promise<ExpenseCategory[]> }
  initialCategoryId?: string | null
  initialPage?: number
  initialPageSize?: number
}
