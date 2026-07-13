import type { InventoryItem, InventoryItemListItem, InventoryLot, InventorySummary, InventorySupplier, InventoryTransaction } from '../../domain/entities/inventory'
import type { InventoryPageResult } from '../../domain/repositories/inventory-repository'
import type { InventoryItemMutationInput, InventoryItemUpdateInput, InventoryMovementInput, InventoryPageInput, InventorySupplierMutationInput, InventorySupplierUpdateInput } from '../dto/inventory-management'

export interface InventoryManagementRepository {
  listItems(input: InventoryPageInput): Promise<InventoryPageResult<InventoryItemListItem>>
  getItem(itemId: string): Promise<InventoryItemListItem>
  createItem(input: InventoryItemMutationInput): Promise<InventoryItem>
  updateItem(input: InventoryItemUpdateInput): Promise<InventoryItem>
  listLots(itemId: string): Promise<InventoryLot[]>
  listMovements(itemId: string, page?: number, pageSize?: number): Promise<InventoryPageResult<InventoryTransaction>>
  recordMovement(input: InventoryMovementInput): Promise<InventoryTransaction>
  getSummary(): Promise<InventorySummary>
  listSuppliers(input?: InventoryPageInput): Promise<InventoryPageResult<InventorySupplier>>
  createSupplier(input: InventorySupplierMutationInput): Promise<InventorySupplier>
  updateSupplier(input: InventorySupplierUpdateInput): Promise<InventorySupplier>
}
