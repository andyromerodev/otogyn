import type { ExpenseCategory } from '~~/src/domain/entities/expense-category'

export interface ExpenseCategoriesViewModelDependencies {
  listCategoriesUseCase: { execute(options?: { includeInactive?: boolean }): Promise<ExpenseCategory[]> }
  createCategoryUseCase: { execute(input: { name: string }): Promise<ExpenseCategory> }
  updateCategoryUseCase: {
    execute(id: string, input: { name?: string; isActive?: boolean }): Promise<ExpenseCategory>
  }
}
