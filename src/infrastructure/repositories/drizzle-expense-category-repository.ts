import { asc, eq } from 'drizzle-orm'
import type { ExpenseCategory } from '../../domain/entities/expense-category'
import type {
  ExpenseCategoryRepository,
  UpdateExpenseCategoryInput,
} from '../../domain/repositories/expense-category-repository'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { expenseCategories } from '../database/schema'

const mapCategory = (row: typeof expenseCategories.$inferSelect): ExpenseCategory => ({
  id: row.id,
  organizationId: row.organizationId,
  name: row.name,
  isActive: row.isActive,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

export class DrizzleExpenseCategoryRepository implements ExpenseCategoryRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async listByOrganization(
    organizationId: string,
    options?: { includeInactive?: boolean },
  ): Promise<ExpenseCategory[]> {
    const rows = await this.db
      .select()
      .from(expenseCategories)
      .where(
        options?.includeInactive
          ? eq(expenseCategories.organizationId, organizationId)
          : eq(expenseCategories.organizationId, organizationId),
      )
      .orderBy(asc(expenseCategories.name))

    return rows
      .filter((r) => options?.includeInactive || r.isActive)
      .map(mapCategory)
  }

  async findById(categoryId: string): Promise<ExpenseCategory | null> {
    const rows = await this.db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.id, categoryId))
      .limit(1)

    return rows[0] ? mapCategory(rows[0]) : null
  }

  async create(category: ExpenseCategory): Promise<ExpenseCategory> {
    const rows = await this.db
      .insert(expenseCategories)
      .values({
        id: category.id,
        organizationId: category.organizationId,
        name: category.name,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })
      .returning()

    return mapCategory(rows[0]!)
  }

  async update(input: UpdateExpenseCategoryInput): Promise<ExpenseCategory> {
    await this.db
      .update(expenseCategories)
      .set({
        name: input.name,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(expenseCategories.id, input.id))

    const rows = await this.db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.id, input.id))
      .limit(1)

    return mapCategory(rows[0]!)
  }
}
