import type {
  CreateExpenseClientInput,
  ExpenseCategoryClientInput,
  ExpenseManagementRepository,
  ListExpensesClientInput,
} from '../../../application/ports/expense-management-repository'
import type { ExpenseListPageResult } from '../../../domain/repositories/expense-repository'
import type { ExpenseCategory } from '../../../domain/entities/expense-category'

export class HttpExpenseRemoteDataSource implements ExpenseManagementRepository {
  async listExpenses(input: ListExpensesClientInput): Promise<ExpenseListPageResult> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (
        request: string,
        options?: Record<string, unknown>,
      ) => Promise<unknown>

      return (await requestFetch('/api/expenses', {
        query: {
          categoryId: input.categoryId,
          expenseDateFrom: input.expenseDateFrom,
          expenseDateTo: input.expenseDateTo,
          page: input.page ?? 1,
          pageSize: input.pageSize ?? 10,
          search: input.search,
        },
      })) as ExpenseListPageResult
    }

    return $fetch<ExpenseListPageResult>('/api/expenses', {
      query: {
        categoryId: input.categoryId,
        expenseDateFrom: input.expenseDateFrom,
        expenseDateTo: input.expenseDateTo,
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 10,
        search: input.search,
      },
    })
  }

  async createExpense(input: CreateExpenseClientInput): Promise<void> {
    await $fetch('/api/expenses', {
      method: 'POST',
      body: input,
    })
  }

  async listCategories(options?: { includeInactive?: boolean }): Promise<ExpenseCategory[]> {
    if (import.meta.server) {
      const requestFetch = useRequestFetch() as (
        request: string,
        options?: Record<string, unknown>,
      ) => Promise<unknown>

      return (await requestFetch('/api/expense-categories', {
        query: { includeInactive: options?.includeInactive ? 'true' : undefined },
      })) as ExpenseCategory[]
    }

    return $fetch<ExpenseCategory[]>('/api/expense-categories', {
      query: { includeInactive: options?.includeInactive ? 'true' : undefined },
    })
  }

  async createCategory(input: ExpenseCategoryClientInput): Promise<ExpenseCategory> {
    return $fetch<ExpenseCategory>('/api/expense-categories', {
      method: 'POST',
      body: input,
    })
  }

  async updateCategory(
    id: string,
    input: Partial<ExpenseCategoryClientInput> & { isActive?: boolean },
  ): Promise<ExpenseCategory> {
    return $fetch<ExpenseCategory>(`/api/expense-categories/${id}`, {
      method: 'PATCH',
      body: input,
    })
  }
}
