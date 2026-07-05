import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { ExpenseRepository } from '../../../domain/repositories/expense-repository'

export interface DeleteExpenseInput {
  expenseId: string
  organizationId: string
}

export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute(input: DeleteExpenseInput): Promise<void> {
    const existing = await this.expenseRepository.findById(input.expenseId)

    if (!existing || existing.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Gasto no encontrado.')
    }

    await this.expenseRepository.delete(input.expenseId)
  }
}
