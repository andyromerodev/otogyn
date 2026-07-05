import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Expense } from '../../../domain/entities/expense'
import type { ExpenseCategoryRepository } from '../../../domain/repositories/expense-category-repository'
import type { ExpenseRepository } from '../../../domain/repositories/expense-repository'
import type { ExpenseMutationInput } from '../../dto/expense'

export interface CreateExpenseInput extends ExpenseMutationInput {
  organizationId: string
  createdBy: string
}

export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly categoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(input: CreateExpenseInput): Promise<Expense> {
    if (input.amount <= 0) {
      throw new BusinessRuleError('El monto del gasto debe ser mayor a cero.')
    }

    const description = input.description.trim()

    if (!description) {
      throw new BusinessRuleError('La descripción del gasto es obligatoria.')
    }

    const category = await this.categoryRepository.findById(input.categoryId)

    if (!category || category.organizationId !== input.organizationId || !category.isActive) {
      throw new BusinessRuleError('Categoría de gasto no encontrada o inactiva.')
    }

    const now = new Date()

    return this.expenseRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      categoryId: input.categoryId,
      amount: input.amount,
      description,
      expenseDate: input.expenseDate,
      notes: input.notes ?? null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    })
  }
}
