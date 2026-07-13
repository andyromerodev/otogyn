import { and, asc, count, desc, eq, gt, ilike, inArray, or } from 'drizzle-orm'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import type {
  InventoryItem,
  InventoryItemListItem,
  InventoryItemStatus,
  InventoryLot,
  InventorySummary,
  InventorySupplier,
  InventoryTransaction,
} from '../../domain/entities/inventory'
import type {
  InventoryItemMutationInput,
  InventoryItemUpdateInput,
  InventoryMovementRecordInput,
  InventoryPageInput,
  InventorySupplierMutationInput,
  InventorySupplierUpdateInput,
} from '../../application/dto/inventory-management'
import type { InventoryPageResult, InventoryRepository } from '../../domain/repositories/inventory-repository'
import { addAppDays, formatLocalDate } from '../../application/utils/date/local-date'
import { allocateFefo } from '../../application/use-cases/inventory/fefo'
import type { DrizzleClient } from '../database/drizzle/client'
import { getDrizzleClient } from '../database/drizzle/client'
import {
  appointments,
  inventoryItems,
  inventoryLots,
  inventorySuppliers,
  inventoryTransactionAllocations,
  inventoryTransactions,
} from '../database/schema'

const mapItem = (row: typeof inventoryItems.$inferSelect): InventoryItem => ({
  ...row,
  barcode: row.barcode,
  description: row.description,
  minimumStock: Number(row.minimumStock),
})

const mapSupplier = (row: typeof inventorySuppliers.$inferSelect): InventorySupplier => ({ ...row })

const mapLot = (
  row: typeof inventoryLots.$inferSelect,
  supplierName: string | null = null,
): InventoryLot => ({
  ...row,
  expiresOn: row.expiresOn,
  unitCost: row.unitCost === null ? null : Number(row.unitCost),
  currentQuantity: Number(row.currentQuantity),
  supplierName,
})

const getStatus = (
  item: InventoryItem,
  physicalStock: number,
  usableStock: number,
  lots: Array<typeof inventoryLots.$inferSelect>,
  today: string,
): { status: InventoryItemStatus, nextExpiry: string | null } => {
  if (!item.isActive) return { status: 'inactive', nextExpiry: null }
  const positiveLots = lots.filter((lot) => Number(lot.currentQuantity) > 0)
  const expired = positiveLots.some((lot) => lot.expiresOn !== null && lot.expiresOn < today)
  const nextExpiry = positiveLots
    .map((lot) => lot.expiresOn)
    .filter((value): value is string => value !== null && value >= today)
    .sort()[0] ?? null
  const alertDate = formatLocalDate(addAppDays(new Date(), item.expiryAlertDays))

  if (usableStock <= 0 && physicalStock <= 0) return { status: 'out_of_stock', nextExpiry }
  if (expired && usableStock <= 0) return { status: 'expired', nextExpiry }
  if (usableStock <= item.minimumStock) return { status: 'low_stock', nextExpiry }
  if (nextExpiry && nextExpiry <= alertDate) return { status: 'expiring', nextExpiry }
  if (expired) return { status: 'expired', nextExpiry }
  return { status: 'healthy', nextExpiry }
}

export class DrizzleInventoryRepository implements InventoryRepository {
  constructor(private readonly db: DrizzleClient = getDrizzleClient()) {}

  private async enrichedItems(organizationId: string): Promise<InventoryItemListItem[]> {
    const [itemRows, lotRows] = await Promise.all([
      this.db.select().from(inventoryItems).where(eq(inventoryItems.organizationId, organizationId)),
      this.db.select().from(inventoryLots).where(eq(inventoryLots.organizationId, organizationId)),
    ])
    const today = formatLocalDate(new Date())

    return itemRows.map((row) => {
      const item = mapItem(row)
      const itemLots = lotRows.filter((lot) => lot.itemId === item.id)
      const physicalStock = itemLots.reduce((sum, lot) => sum + Number(lot.currentQuantity), 0)
      const usableStock = itemLots
        .filter((lot) => lot.expiresOn === null || lot.expiresOn >= today)
        .reduce((sum, lot) => sum + Number(lot.currentQuantity), 0)
      const state = getStatus(item, physicalStock, usableStock, itemLots, today)
      return { ...item, physicalStock, usableStock, ...state }
    })
  }

  async listItems(organizationId: string, input: InventoryPageInput): Promise<InventoryPageResult<InventoryItemListItem>> {
    const pageSize = Math.min(Math.max(input.pageSize ?? 10, 1), 50)
    const search = input.search?.trim().toLocaleLowerCase('es') ?? ''
    const status = input.status ?? 'all'
    let items = await this.enrichedItems(organizationId)
    items = items.filter((item) =>
      (!search || `${item.name} ${item.sku} ${item.barcode ?? ''}`.toLocaleLowerCase('es').includes(search))
      && (status === 'all' || item.status === status),
    )
    items.sort((a, b) => a.name.localeCompare(b.name, 'es'))
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(input.page ?? 1, 1), totalPages)
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages }
  }

  async findItemById(organizationId: string, itemId: string): Promise<InventoryItemListItem | null> {
    return (await this.enrichedItems(organizationId)).find((item) => item.id === itemId) ?? null
  }

  async createItem(organizationId: string, input: InventoryItemMutationInput): Promise<InventoryItem> {
    try {
      const [row] = await this.db.insert(inventoryItems).values({
        organizationId,
        name: input.name.trim(),
        sku: input.sku.trim().toUpperCase(),
        barcode: input.barcode?.trim() || null,
        description: input.description?.trim() || null,
        unit: input.unit.trim(),
        minimumStock: input.minimumStock.toFixed(3),
        expiryAlertDays: input.expiryAlertDays,
        isActive: input.isActive ?? true,
      }).returning()
      return mapItem(row!)
    } catch (error) {
      if (error instanceof Error && error.message.includes('inventory_items_org_sku_idx')) {
        throw new BusinessRuleError('Ya existe un insumo con ese SKU.')
      }
      throw error
    }
  }

  async updateItem(organizationId: string, input: InventoryItemUpdateInput): Promise<InventoryItem> {
    const [row] = await this.db.update(inventoryItems).set({
      name: input.name?.trim(),
      sku: input.sku?.trim().toUpperCase(),
      barcode: input.barcode === undefined ? undefined : input.barcode?.trim() || null,
      description: input.description === undefined ? undefined : input.description?.trim() || null,
      unit: input.unit?.trim(),
      minimumStock: input.minimumStock === undefined ? undefined : input.minimumStock.toFixed(3),
      expiryAlertDays: input.expiryAlertDays,
      isActive: input.isActive,
      updatedAt: new Date(),
    }).where(and(eq(inventoryItems.id, input.id), eq(inventoryItems.organizationId, organizationId))).returning()
    if (!row) throw new BusinessRuleError('Insumo no encontrado.')
    return mapItem(row)
  }

  async listLots(organizationId: string, itemId: string): Promise<InventoryLot[]> {
    const rows = await this.db.select({ lot: inventoryLots, supplierName: inventorySuppliers.name })
      .from(inventoryLots)
      .leftJoin(inventorySuppliers, eq(inventoryLots.supplierId, inventorySuppliers.id))
      .where(and(eq(inventoryLots.organizationId, organizationId), eq(inventoryLots.itemId, itemId)))
      .orderBy(asc(inventoryLots.expiresOn), asc(inventoryLots.receivedAt))
    return rows.map(({ lot, supplierName }) => mapLot(lot, supplierName))
  }

  async listMovements(organizationId: string, itemId: string, requestedPage: number, requestedPageSize: number): Promise<InventoryPageResult<InventoryTransaction>> {
    const pageSize = Math.min(Math.max(requestedPageSize, 1), 50)
    const where = and(eq(inventoryTransactions.organizationId, organizationId), eq(inventoryTransactions.itemId, itemId))
    const [{ value: total = 0 } = { value: 0 }] = await this.db.select({ value: count() }).from(inventoryTransactions).where(where)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(requestedPage, 1), totalPages)
    const transactionRows = await this.db.select({ transaction: inventoryTransactions, itemName: inventoryItems.name })
      .from(inventoryTransactions)
      .innerJoin(inventoryItems, eq(inventoryTransactions.itemId, inventoryItems.id))
      .where(where).orderBy(desc(inventoryTransactions.createdAt)).limit(pageSize).offset((page - 1) * pageSize)
    const ids = transactionRows.map(({ transaction }) => transaction.id)
    const allocations = ids.length ? await this.db.select({ allocation: inventoryTransactionAllocations, lotNumber: inventoryLots.lotNumber })
      .from(inventoryTransactionAllocations)
      .innerJoin(inventoryLots, eq(inventoryTransactionAllocations.lotId, inventoryLots.id))
      .where(inArray(inventoryTransactionAllocations.transactionId, ids)) : []
    return {
      items: transactionRows.map(({ transaction, itemName }) => ({
        ...transaction,
        quantity: Number(transaction.quantity),
        itemName,
        allocations: allocations.filter(({ allocation }) => allocation.transactionId === transaction.id).map(({ allocation, lotNumber }) => ({
          lotId: allocation.lotId,
          lotNumber,
          quantityDelta: Number(allocation.quantityDelta),
        })),
      })),
      total, page, pageSize, totalPages,
    }
  }

  async recordMovement(input: InventoryMovementRecordInput): Promise<InventoryTransaction> {
    try {
      const transactionId = await this.db.transaction(async (tx) => {
        const [item] = await tx.select().from(inventoryItems).where(and(
          eq(inventoryItems.id, input.itemId), eq(inventoryItems.organizationId, input.organizationId),
        )).limit(1)
        if (!item || !item.isActive) throw new BusinessRuleError('El insumo no existe o está inactivo.')

        if (input.type === 'consumption' && input.appointmentId) {
          const [appointment] = await tx.select({ id: appointments.id }).from(appointments).where(and(
            eq(appointments.id, input.appointmentId), eq(appointments.organizationId, input.organizationId),
          )).limit(1)
          if (!appointment) throw new BusinessRuleError('La cita vinculada no pertenece a esta organización.')
        }

        const allocations: Array<{ lotId: string, delta: number }> = []
        const today = formatLocalDate(new Date())

        if (input.type === 'entry') {
          if (input.supplierId) {
            const [supplier] = await tx.select().from(inventorySuppliers).where(and(
              eq(inventorySuppliers.id, input.supplierId), eq(inventorySuppliers.organizationId, input.organizationId), eq(inventorySuppliers.isActive, true),
            )).limit(1)
            if (!supplier) throw new BusinessRuleError('El proveedor no existe o está inactivo.')
          }
          const [existing] = await tx.select().from(inventoryLots).where(and(
            eq(inventoryLots.organizationId, input.organizationId), eq(inventoryLots.itemId, input.itemId), eq(inventoryLots.lotNumber, input.lotNumber.trim()),
          )).limit(1)
          if (existing && (
            existing.expiresOn !== (input.expiresOn || null)
            || existing.supplierId !== (input.supplierId ?? null)
          )) {
            throw new BusinessRuleError('El lote ya existe con otro vencimiento o proveedor.')
          }
          const lot = existing ?? (await tx.insert(inventoryLots).values({
            organizationId: input.organizationId,
            itemId: input.itemId,
            supplierId: input.supplierId ?? null,
            lotNumber: input.lotNumber.trim(),
            expiresOn: input.expiresOn || null,
            receivedAt: input.receivedAt ?? new Date(),
            unitCost: input.unitCost == null ? null : input.unitCost.toFixed(4),
            currentQuantity: '0',
          }).returning())[0]!
          await tx.update(inventoryLots).set({
            currentQuantity: (Number(lot.currentQuantity) + input.quantity).toFixed(3),
            updatedAt: new Date(),
          }).where(eq(inventoryLots.id, lot.id))
          allocations.push({ lotId: lot.id, delta: input.quantity })
        } else if (input.type === 'consumption') {
          const candidates = await tx.select().from(inventoryLots).where(and(
            eq(inventoryLots.organizationId, input.organizationId), eq(inventoryLots.itemId, input.itemId), gt(inventoryLots.currentQuantity, '0'),
          ))
          const result = allocateFefo(candidates.map((lot) => ({ ...lot, currentQuantity: Number(lot.currentQuantity) })), input.quantity, today)
          for (const allocation of result.allocations) {
            const lot = candidates.find((candidate) => candidate.id === allocation.lotId)!
            await tx.update(inventoryLots).set({ currentQuantity: (Number(lot.currentQuantity) - allocation.quantity).toFixed(3), updatedAt: new Date() }).where(eq(inventoryLots.id, lot.id))
            allocations.push({ lotId: lot.id, delta: -allocation.quantity })
          }
          const remaining = result.remaining
          if (remaining > 0) throw new BusinessRuleError('No hay stock utilizable suficiente para registrar el consumo.')
        } else {
          const [lot] = await tx.select().from(inventoryLots).where(and(
            eq(inventoryLots.id, input.lotId), eq(inventoryLots.itemId, input.itemId), eq(inventoryLots.organizationId, input.organizationId),
          )).limit(1)
          if (!lot) throw new BusinessRuleError('Lote no encontrado para este insumo.')
          const delta = input.type === 'adjustment_in' ? input.quantity : -input.quantity
          const next = Number(lot.currentQuantity) + delta
          if (next < 0) throw new BusinessRuleError('El ajuste dejaría el lote con stock negativo.')
          await tx.update(inventoryLots).set({ currentQuantity: next.toFixed(3), updatedAt: new Date() }).where(eq(inventoryLots.id, lot.id))
          allocations.push({ lotId: lot.id, delta })
        }

        const transactionReason = input.type === 'consumption'
          ? input.reason ?? null
          : input.type === 'adjustment_in' || input.type === 'adjustment_out'
            ? input.reason
            : null
        const [transaction] = await tx.insert(inventoryTransactions).values({
          organizationId: input.organizationId,
          itemId: input.itemId,
          type: input.type,
          quantity: input.quantity.toFixed(3),
          appointmentId: input.type === 'consumption' ? input.appointmentId ?? null : null,
          reason: transactionReason,
          notes: input.notes ?? null,
          createdBy: input.createdBy,
        }).returning()
        await tx.insert(inventoryTransactionAllocations).values(allocations.map((allocation) => ({
          transactionId: transaction!.id,
          lotId: allocation.lotId,
          quantityDelta: allocation.delta.toFixed(3),
        })))
        return transaction!.id
      }, { isolationLevel: 'serializable' })

      const page = await this.listMovements(input.organizationId, input.itemId, 1, 50)
      return page.items.find((movement) => movement.id === transactionId)!
    } catch (error) {
      if (error instanceof BusinessRuleError) throw error
      if (error instanceof Error && error.message.includes('could not serialize')) {
        throw new BusinessRuleError('El inventario cambió al mismo tiempo. Revisa el stock e intenta nuevamente.')
      }
      throw error
    }
  }

  async getSummary(organizationId: string): Promise<InventorySummary> {
    const items = await this.enrichedItems(organizationId)
    const today = formatLocalDate(new Date())
    const lots = await this.db.select().from(inventoryLots).where(eq(inventoryLots.organizationId, organizationId))
    return {
      activeItems: items.filter((item) => item.isActive).length,
      lowStockItems: items.filter((item) => item.status === 'low_stock').length,
      outOfStockItems: items.filter((item) => item.status === 'out_of_stock').length,
      expiringItems: items.filter((item) => item.status === 'expiring').length,
      expiredLots: lots.filter((lot) => Number(lot.currentQuantity) > 0 && lot.expiresOn !== null && lot.expiresOn < today).length,
    }
  }

  async listSuppliers(organizationId: string, input: InventoryPageInput): Promise<InventoryPageResult<InventorySupplier>> {
    const pageSize = Math.min(Math.max(input.pageSize ?? 20, 1), 50)
    const conditions = [eq(inventorySuppliers.organizationId, organizationId)]
    if (input.search?.trim()) {
      const pattern = `%${input.search.trim()}%`
      conditions.push(or(ilike(inventorySuppliers.name, pattern), ilike(inventorySuppliers.contactName, pattern), ilike(inventorySuppliers.email, pattern))!)
    }
    if (input.status === 'inactive') conditions.push(eq(inventorySuppliers.isActive, false))
    const where = and(...conditions)
    const [{ value: total = 0 } = { value: 0 }] = await this.db.select({ value: count() }).from(inventorySuppliers).where(where)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(input.page ?? 1, 1), totalPages)
    const rows = await this.db.select().from(inventorySuppliers).where(where).orderBy(asc(inventorySuppliers.name)).limit(pageSize).offset((page - 1) * pageSize)
    return { items: rows.map(mapSupplier), total, page, pageSize, totalPages }
  }

  async findSupplierById(organizationId: string, supplierId: string): Promise<InventorySupplier | null> {
    const [row] = await this.db.select().from(inventorySuppliers).where(and(eq(inventorySuppliers.id, supplierId), eq(inventorySuppliers.organizationId, organizationId))).limit(1)
    return row ? mapSupplier(row) : null
  }

  async createSupplier(organizationId: string, input: InventorySupplierMutationInput): Promise<InventorySupplier> {
    const [row] = await this.db.insert(inventorySuppliers).values({ organizationId, name: input.name.trim(), contactName: input.contactName?.trim() || null, phone: input.phone?.trim() || null, email: input.email?.trim() || null, notes: input.notes?.trim() || null, isActive: input.isActive ?? true }).returning()
    return mapSupplier(row!)
  }

  async updateSupplier(organizationId: string, input: InventorySupplierUpdateInput): Promise<InventorySupplier> {
    const [row] = await this.db.update(inventorySuppliers).set({ name: input.name?.trim(), contactName: input.contactName === undefined ? undefined : input.contactName?.trim() || null, phone: input.phone === undefined ? undefined : input.phone?.trim() || null, email: input.email === undefined ? undefined : input.email?.trim() || null, notes: input.notes === undefined ? undefined : input.notes?.trim() || null, isActive: input.isActive, updatedAt: new Date() }).where(and(eq(inventorySuppliers.id, input.id), eq(inventorySuppliers.organizationId, organizationId))).returning()
    if (!row) throw new BusinessRuleError('Proveedor no encontrado.')
    return mapSupplier(row)
  }
}
