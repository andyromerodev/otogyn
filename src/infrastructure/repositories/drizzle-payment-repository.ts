import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import type { Payment } from '../../domain/entities/payment'
import type {
  PaymentListItem,
  PaymentListPageQuery,
  PaymentListPageResult,
  PaymentRepository,
  UpdatePaymentInput,
} from '../../domain/repositories/payment-repository'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import { patients, payments } from '../database/schema'

const mapPayment = (row: typeof payments.$inferSelect): Payment => ({
  id: row.id,
  organizationId: row.organizationId,
  patientId: row.patientId,
  appointmentId: row.appointmentId,
  consultationId: row.consultationId,
  amount: Number(row.amount),
  method: row.method,
  concept: row.concept,
  paidAt: row.paidAt,
  notes: row.notes,
  createdBy: row.createdBy,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})

const mapPaymentListItem = (row: {
  payment: typeof payments.$inferSelect
  patientName: string | null
}): PaymentListItem => ({
  ...mapPayment(row.payment),
  patientName: row.patientName,
})

export class DrizzlePaymentRepository implements PaymentRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  async findById(paymentId: string): Promise<Payment | null> {
    const rows = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1)

    return rows[0] ? mapPayment(rows[0]) : null
  }

  async listPage(query: PaymentListPageQuery): Promise<PaymentListPageResult> {
    const pageSize = Math.min(Math.max(query.pageSize, 1), 50)
    const conditions = [eq(payments.organizationId, query.organizationId)]

    if (query.patientId) {
      conditions.push(eq(payments.patientId, query.patientId))
    }

    if (query.method) {
      conditions.push(eq(payments.method, query.method))
    }

    if (query.paidAtFrom) {
      conditions.push(gte(payments.paidAt, query.paidAtFrom))
    }

    if (query.paidAtTo) {
      conditions.push(lte(payments.paidAt, query.paidAtTo))
    }

    const filteredWhere = and(...conditions)
    const totalRows = await this.db
      .select({ value: count() })
      .from(payments)
      .where(filteredWhere)

    const total = totalRows[0]?.value ?? 0
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(query.page, 1), totalPages)
    const offset = (page - 1) * pageSize

    const rows = await this.db
      .select({
        payment: payments,
        patientName: patients.fullName,
      })
      .from(payments)
      .leftJoin(patients, eq(payments.patientId, patients.id))
      .where(filteredWhere)
      .orderBy(desc(payments.paidAt))
      .limit(pageSize)
      .offset(offset)

    return {
      items: rows.map(mapPaymentListItem),
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  async create(payment: Payment): Promise<Payment> {
    const rows = await this.db
      .insert(payments)
      .values({
        id: payment.id,
        organizationId: payment.organizationId,
        patientId: payment.patientId,
        appointmentId: payment.appointmentId,
        consultationId: payment.consultationId,
        amount: payment.amount.toFixed(2),
        method: payment.method,
        concept: payment.concept,
        paidAt: payment.paidAt,
        notes: payment.notes,
        createdBy: payment.createdBy,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      })
      .returning()

    return mapPayment(rows[0]!)
  }

  async update(input: UpdatePaymentInput): Promise<Payment> {
    const rows = await this.db
      .update(payments)
      .set({
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        consultationId: input.consultationId,
        amount: input.amount === undefined ? undefined : input.amount.toFixed(2),
        method: input.method,
        concept: input.concept,
        paidAt: input.paidAt,
        notes: input.notes,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, input.id))
      .returning()

    return mapPayment(rows[0]!)
  }

  async delete(paymentId: string): Promise<void> {
    await this.db
      .delete(payments)
      .where(eq(payments.id, paymentId))
  }
}
