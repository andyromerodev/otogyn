import type {
  ExpenseListPageResult,
  ExpenseRepository,
} from '../../../domain/repositories/expense-repository'
import type { ExpenseListQueryInput } from '../../dto/expense'

export interface ListExpensesInput extends ExpenseListQueryInput {
  organizationId: string
}

export class ListExpensesUseCase {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  execute(input: ListExpensesInput): Promise<ExpenseListPageResult> {
    return this.expenseRepository.listPage({
      organizationId: input.organizationId,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
      categoryId: input.categoryId,
      expenseDateFrom: input.expenseDateFrom,
      expenseDateTo: input.expenseDateTo,
      search: input.search,
    })
  }
}
