import type { ExpenseCategory } from '../../../domain/entities/expense-category'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'

export interface ListExpenseCategoriesInput {
  organizationId: string
  includeInactive?: boolean
}

export class ListExpenseCategoriesUseCase {
  constructor(private readonly categoryRepository: ExpenseCategoryRepository) {}

  execute(input: ListExpenseCategoriesInput): Promise<ExpenseCategory[]> {
    return this.categoryRepository.listByOrganization(input.organizationId, {
      includeInactive: input.includeInactive ?? false,
    })
  }
}
