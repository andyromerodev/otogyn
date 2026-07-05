import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import type { Expense } from '../../domain/entities/expense'
import type {
  ExpenseListItem,
  ExpenseListPageQuery,
  ExpenseListPageResult,
  ExpenseRepository,
  UpdateExpenseInput,
} from '../../domain/repositories/expense-repository'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { expenseCategories, expenses } from '../database/schema'

const mapExpense = (row: typeof expenses.$inferSelect): Expense => ({
  id: row.id,
  organizationId: row.organizationId,
  categoryId: row.categoryId,
  amount: Number(row.amount),
  description: row.description,
  expenseDate: row.expenseDate,
  notes: row.notes,
  createdBy: row.createdBy,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapExpenseListItem = (row: {
  expense: typeof expenses.$inferSelect
  categoryName: string | null
}): ExpenseListItem => ({
  ...mapExpense(row.expense),
  categoryName: row.categoryName ?? '',
})

export class DrizzleExpenseRepository implements ExpenseRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async findById(expenseId: string): Promise<Expense | null> {
    const rows = await this.db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .limit(1)

    return rows[0] ? mapExpense(rows[0]) : null
  }

  async listPage(query: ExpenseListPageQuery): Promise<ExpenseListPageResult> {
    const pageSize = Math.min(Math.max(query.pageSize, 1), 50)
    const conditions = [eq(expenses.organizationId, query.organizationId)]

    if (query.categoryId) {
      conditions.push(eq(expenses.categoryId, query.categoryId))
    }

    if (query.expenseDateFrom) {
      conditions.push(gte(expenses.expenseDate, query.expenseDateFrom))
    }

    if (query.expenseDateTo) {
      conditions.push(lte(expenses.expenseDate, query.expenseDateTo))
    }

    const filteredWhere = and(...conditions)
    const totalRows = await this.db
      .select({ value: count() })
      .from(expenses)
      .where(filteredWhere)

    const total = totalRows[0]?.value ?? 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(query.page, 1), totalPages)
    const offset = (page - 1) * pageSize

    const rows = await this.db
      .select({
        expense: expenses,
        categoryName: expenseCategories.name,
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(filteredWhere)
      .orderBy(desc(expenses.expenseDate))
      .limit(pageSize)
      .offset(offset)

    return {
      items: rows.map(mapExpenseListItem),
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  async create(expense: Expense): Promise<Expense> {
    const rows = await this.db
      .insert(expenses)
      .values({
        id: expense.id,
        organizationId: expense.organizationId,
        categoryId: expense.categoryId,
        amount: expense.amount.toFixed(2),
        description: expense.description,
        expenseDate: expense.expenseDate,
        notes: expense.notes,
        createdBy: expense.createdBy,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      })
      .returning()

    return mapExpense(rows[0]!)
  }

  async update(input: UpdateExpenseInput): Promise<Expense> {
    const rows = await this.db
      .update(expenses)
      .set({
        categoryId: input.categoryId,
        amount: input.amount === undefined ? undefined : input.amount.toFixed(2),
        description: input.description,
        expenseDate: input.expenseDate,
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, input.id))
      .returning()

    return mapExpense(rows[0]!)
  }

  async delete(expenseId: string): Promise<void> {
    await this.db
      .delete(expenses)
      .where(eq(expenses.id, expenseId))
  }
}
