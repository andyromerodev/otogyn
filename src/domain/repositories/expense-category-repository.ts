import type { ExpenseCategory } from '../entities/expense-category'

export interface UpdateExpenseCategoryInput {
  id: string
  name?: string
  isActive?: boolean
}

export interface ExpenseCategoryRepository {
  listByOrganization(
    organizationId: string,
    options?: { includeInactive?: boolean },
  ): Promise<ExpenseCategory[]>
  findById(categoryId: string): Promise<ExpenseCategory | null>
  create(category: ExpenseCategory): Promise<ExpenseCategory>
  update(input: UpdateExpenseCategoryInput): Promise<ExpenseCategory>
}
