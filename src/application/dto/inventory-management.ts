import type { InventoryItemStatus, InventoryTransactionType } from '../../domain/entities/inventory'

export interface InventoryPageInput {
  search?: string
  status?: 'all' | InventoryItemStatus
  page?: number
  pageSize?: number
}

export interface InventoryItemMutationInput {
  name: string
  sku: string
  barcode?: string | null
  description?: string | null
  unit: string
  minimumStock: number
  expiryAlertDays: number
  isActive?: boolean
}

export interface InventoryItemUpdateInput extends Partial<InventoryItemMutationInput> {
  id: string
}

export interface InventorySupplierMutationInput {
  name: string
  contactName?: string | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  isActive?: boolean
}

export interface InventorySupplierUpdateInput extends Partial<InventorySupplierMutationInput> {
  id: string
}

export interface InventoryMovementBaseInput {
  itemId: string
  quantity: number
  notes?: string | null
}

export interface InventoryEntryInput extends InventoryMovementBaseInput {
  type: 'entry'
  lotNumber: string
  expiresOn?: string | null
  supplierId?: string | null
  unitCost?: number | null
  receivedAt?: Date
}

export interface InventoryConsumptionInput extends InventoryMovementBaseInput {
  type: 'consumption'
  appointmentId?: string | null
  reason?: string | null
}

export interface InventoryAdjustmentInput extends InventoryMovementBaseInput {
  type: 'adjustment_in' | 'adjustment_out'
  lotId: string
  reason: string
}

export type InventoryMovementInput = InventoryEntryInput | InventoryConsumptionInput | InventoryAdjustmentInput

export type InventoryMovementRecordInput = InventoryMovementInput & {
  organizationId: string
  createdBy: string
}

export interface InventoryMovementListInput {
  itemId: string
  page?: number
  pageSize?: number
  type?: InventoryTransactionType
}
