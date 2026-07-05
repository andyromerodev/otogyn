export interface Expense {
  id: string
  organizationId: string
  categoryId: string
  amount: number
  description: string
  expenseDate: Date
  notes: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
