export interface ExpenseMutationInput {
  categoryId: string
  amount: number
  description: string
  expenseDate: Date
  notes?: string | null
}

export interface ExpenseUpdateInput {
  id: string
  categoryId?: string
  amount?: number
  description?: string
  expenseDate?: Date
  notes?: string | null
}

export interface ExpenseListQueryInput {
  categoryId?: string
  expenseDateFrom?: Date
  expenseDateTo?: Date
  page?: number
  pageSize?: number
  search?: string
}

export interface ExpenseCategoryMutationInput {
  name: string
}

export interface ExpenseCategoryUpdateInput {
  id: string
  name?: string
  isActive?: boolean
}
