import { and, eq, gte, lt, sql } from 'drizzle-orm'
import type {
  FinanceMonthlySeriesItem,
  FinanceMonthlySeriesQuery,
  FinanceReportRepository,
} from '../../domain/repositories/finance-report-repository'
import { APP_TIME_ZONE } from '../../application/utils/date/local-date'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { expenses, payments } from '../database/schema'

export class DrizzleFinanceReportRepository implements FinanceReportRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async getMonthlySeries(query: FinanceMonthlySeriesQuery): Promise<FinanceMonthlySeriesItem[]> {
    const appTimeZoneSql = sql.raw(`'${APP_TIME_ZONE}'`)
    const paymentMonthKey = sql<string>`
      to_char(date_trunc('month', timezone(${appTimeZoneSql}, ${payments.paidAt})), 'YYYY-MM')
    `
    const expenseMonthKey = sql<string>`
      to_char(date_trunc('month', timezone(${appTimeZoneSql}, ${expenses.expenseDate})), 'YYYY-MM')
    `
    const totalIncome = sql<string>`coalesce(sum(${payments.amount}), 0)::text`
    const totalExpenses = sql<string>`coalesce(sum(${expenses.amount}), 0)::text`

    const [paymentRows, expenseRows] = await Promise.all([
      this.db
        .select({
          monthKey: paymentMonthKey,
          total: totalIncome,
        })
        .from(payments)
        .where(
          and(
            eq(payments.organizationId, query.organizationId),
            gte(payments.paidAt, query.from),
            lt(payments.paidAt, query.to),
          ),
        )
        .groupBy(sql.raw('1'))
        .orderBy(sql.raw('1')),
      this.db
        .select({
          monthKey: expenseMonthKey,
          total: totalExpenses,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.organizationId, query.organizationId),
            gte(expenses.expenseDate, query.from),
            lt(expenses.expenseDate, query.to),
          ),
        )
        .groupBy(sql.raw('1'))
        .orderBy(sql.raw('1')),
    ])

    const seriesMap = new Map<string, FinanceMonthlySeriesItem>()

    for (const row of paymentRows) {
      seriesMap.set(row.monthKey, {
        monthKey: row.monthKey,
        income: Number(row.total),
        expenses: 0,
      })
    }

    for (const row of expenseRows) {
      const current = seriesMap.get(row.monthKey)

      if (current) {
        current.expenses = Number(row.total)
        continue
      }

      seriesMap.set(row.monthKey, {
        monthKey: row.monthKey,
        income: 0,
        expenses: Number(row.total),
      })
    }

    return [...seriesMap.values()].sort((left, right) => left.monthKey.localeCompare(right.monthKey))
  }
}
