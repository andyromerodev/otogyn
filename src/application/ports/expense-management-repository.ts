import type { ExpenseListPageResult } from '../../domain/repositories/expense-repository'
import type { ExpenseCategory } from '../../domain/entities/expense-category'

export interface ListExpensesClientInput {
  categoryId?: string
  expenseDateFrom?: string
  expenseDateTo?: string
  page?: number
  pageSize?: number
  search?: string
}

export interface CreateExpenseClientInput {
  categoryId: string
  amount: number
  description: string
  expenseDate: string
  notes?: string | null
}

export interface ExpenseCategoryClientInput {
  name: string
}

export interface ExpenseManagementRepository {
  listExpenses(input: ListExpensesClientInput): Promise<ExpenseListPageResult>
  createExpense(input: CreateExpenseClientInput): Promise<void>
  listCategories(options?: { includeInactive?: boolean }): Promise<ExpenseCategory[]>
  createCategory(input: ExpenseCategoryClientInput): Promise<ExpenseCategory>
  updateCategory(id: string, input: Partial<ExpenseCategoryClientInput> & { isActive?: boolean }): Promise<ExpenseCategory>
}
