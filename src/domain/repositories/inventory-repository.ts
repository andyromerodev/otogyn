import type {
  InventoryItem,
  InventoryItemListItem,
  InventoryLot,
  InventorySummary,
  InventorySupplier,
  InventoryTransaction,
} from '../entities/inventory'
import type {
  InventoryItemMutationInput,
  InventoryItemUpdateInput,
  InventoryMovementRecordInput,
  InventoryPageInput,
  InventorySupplierMutationInput,
  InventorySupplierUpdateInput,
} from '../../application/dto/inventory-management'

export interface InventoryPageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface InventoryRepository {
  listItems(organizationId: string, input: InventoryPageInput): Promise<InventoryPageResult<InventoryItemListItem>>
  findItemById(organizationId: string, itemId: string): Promise<InventoryItemListItem | null>
  createItem(organizationId: string, input: InventoryItemMutationInput): Promise<InventoryItem>
  updateItem(organizationId: string, input: InventoryItemUpdateInput): Promise<InventoryItem>
  listLots(organizationId: string, itemId: string): Promise<InventoryLot[]>
  listMovements(organizationId: string, itemId: string, page: number, pageSize: number): Promise<InventoryPageResult<InventoryTransaction>>
  recordMovement(input: InventoryMovementRecordInput): Promise<InventoryTransaction>
  getSummary(organizationId: string): Promise<InventorySummary>
  listSuppliers(organizationId: string, input: InventoryPageInput): Promise<InventoryPageResult<InventorySupplier>>
  findSupplierById(organizationId: string, supplierId: string): Promise<InventorySupplier | null>
  createSupplier(organizationId: string, input: InventorySupplierMutationInput): Promise<InventorySupplier>
  updateSupplier(organizationId: string, input: InventorySupplierUpdateInput): Promise<InventorySupplier>
}
