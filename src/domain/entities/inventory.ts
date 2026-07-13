export type InventoryItemStatus = 'healthy' | 'low_stock' | 'out_of_stock' | 'expiring' | 'expired' | 'inactive'
export type InventoryTransactionType = 'entry' | 'consumption' | 'adjustment_in' | 'adjustment_out'

export interface InventoryItem {
  id: string
  organizationId: string
  name: string
  sku: string
  barcode: string | null
  description: string | null
  unit: string
  minimumStock: number
  expiryAlertDays: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface InventorySupplier {
  id: string
  organizationId: string
  name: string
  contactName: string | null
  phone: string | null
  email: string | null
  notes: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface InventoryLot {
  id: string
  organizationId: string
  itemId: string
  supplierId: string | null
  supplierName: string | null
  lotNumber: string
  expiresOn: string | null
  receivedAt: Date
  unitCost: number | null
  currentQuantity: number
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItemListItem extends InventoryItem {
  usableStock: number
  physicalStock: number
  nextExpiry: string | null
  status: InventoryItemStatus
}

export interface InventoryTransaction {
  id: string
  organizationId: string
  itemId: string
  itemName: string
  type: InventoryTransactionType
  quantity: number
  appointmentId: string | null
  reason: string | null
  notes: string | null
  createdBy: string
  createdAt: Date
  allocations: Array<{
    lotId: string
    lotNumber: string
    quantityDelta: number
  }>
}

export interface InventorySummary {
  activeItems: number
  lowStockItems: number
  outOfStockItems: number
  expiringItems: number
  expiredLots: number
}
