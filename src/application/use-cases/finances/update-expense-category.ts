import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { ExpenseCategory } from '../../../domain/entities/expense-category'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'
import type { ExpenseCategoryUpdateInput } from '../../dto/expense'

export interface UpdateExpenseCategoryUseCaseInput extends ExpenseCategoryUpdateInput {
  organizationId: string
}

export class UpdateExpenseCategoryUseCase {
  constructor(private readonly categoryRepository: ExpenseCategoryRepository) {}

  async execute(input: UpdateExpenseCategoryUseCaseInput): Promise<ExpenseCategory> {
    const existing = await this.categoryRepository.findById(input.id)

    if (!existing || existing.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Categoría de gasto no encontrada.')
    }

    const name = input.name?.trim()

    if (name !== undefined && !name) {
      throw new BusinessRuleError('El nombre de la categoría es obligatorio.')
    }

    return this.categoryRepository.update({
      id: input.id,
      name,
      isActive: input.isActive,
    })
  }
}
