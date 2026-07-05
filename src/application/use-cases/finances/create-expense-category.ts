import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { ExpenseCategory } from '../../../domain/entities/expense-category'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'

export interface CreateExpenseCategoryInput {
  organizationId: string
  name: string
}

export class CreateExpenseCategoryUseCase {
  constructor(private readonly categoryRepository: ExpenseCategoryRepository) {}

  async execute(input: CreateExpenseCategoryInput): Promise<ExpenseCategory> {
    const name = input.name.trim()

    if (!name) {
      throw new BusinessRuleError('El nombre de la categoría es obligatorio.')
    }

    const now = new Date()

    return this.categoryRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      name,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
  }
}
