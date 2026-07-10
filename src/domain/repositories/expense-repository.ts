import type { Expense } from '../entities/expense'

export interface ExpenseListPageQuery {
  organizationId: string
  page: number
  pageSize: number
  categoryId?: string
  expenseDateFrom?: Date
  expenseDateTo?: Date
  search?: string
}

export interface ExpenseListItem extends Expense {
  categoryName: string
}

export interface ExpenseListPageResult {
  items: ExpenseListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UpdateExpenseInput {
  id: string
  categoryId?: string
  amount?: number
  description?: string
  expenseDate?: Date
  notes?: string | null
}

export interface ExpenseRepository {
  findById(expenseId: string): Promise<Expense | null>
  listPage(query: ExpenseListPageQuery): Promise<ExpenseListPageResult>
  create(expense: Expense): Promise<Expense>
  update(input: UpdateExpenseInput): Promise<Expense>
  delete(expenseId: string): Promise<void>
}
