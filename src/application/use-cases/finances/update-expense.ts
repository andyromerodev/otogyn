import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Expense } from '../../../domain/entities/expense'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'
import type { ExpenseRepository } from '../../../domain/repositories/expense-repository'
import type { ExpenseUpdateInput } from '../../dto/expense'

export interface UpdateExpenseUseCaseInput extends ExpenseUpdateInput {
  organizationId: string
}

export class UpdateExpenseUseCase {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly categoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(input: UpdateExpenseUseCaseInput): Promise<Expense> {
    const existing = await this.expenseRepository.findById(input.id)

    if (!existing || existing.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Gasto no encontrado.')
    }

    if (input.amount !== undefined && input.amount <= 0) {
      throw new BusinessRuleError('El monto del gasto debe ser mayor a cero.')
    }

    const description = input.description?.trim()

    if (description !== undefined && !description) {
      throw new BusinessRuleError('La descripción del gasto es obligatoria.')
    }

    if (input.categoryId !== undefined) {
      const category = await this.categoryRepository.findById(input.categoryId)

      if (!category || category.organizationId !== input.organizationId || !category.isActive) {
        throw new BusinessRuleError('Categoría de gasto no encontrada o inactiva.')
      }
    }

    return this.expenseRepository.update({
      id: input.id,
      categoryId: input.categoryId,
      amount: input.amount,
      description,
      expenseDate: input.expenseDate,
      notes: input.notes,
    })
  }
}
