import type { InventoryRemoteDataSource } from './inventory-remote-data-source'
import type { InventoryItemMutationInput, InventoryItemUpdateInput, InventoryMovementInput, InventoryPageInput, InventorySupplierMutationInput, InventorySupplierUpdateInput } from '../../../application/dto/inventory-management'
import type { InventoryItem, InventoryItemListItem, InventoryLot, InventorySummary, InventorySupplier, InventoryTransaction } from '../../../domain/entities/inventory'
import type { InventoryPageResult } from '../../../domain/repositories/inventory-repository'
import { $fetch as apiFetch } from 'ofetch'

const toQuery = (input: InventoryPageInput = {}) => ({
  search: input.search || undefined,
  status: input.status ?? 'all',
  page: input.page ?? 1,
  pageSize: input.pageSize ?? 10,
})

export class HttpInventoryRemoteDataSource implements InventoryRemoteDataSource {
  listItems(input: InventoryPageInput) { return apiFetch('/api/inventory/items', { query: toQuery(input) }) as Promise<InventoryPageResult<InventoryItemListItem>> }
  getItem(itemId: string) { return apiFetch(`/api/inventory/items/${itemId}`) as Promise<InventoryItemListItem> }
  createItem(input: InventoryItemMutationInput) { return apiFetch('/api/inventory/items', { method: 'POST', body: input }) as Promise<InventoryItem> }
  updateItem(input: InventoryItemUpdateInput) { return apiFetch(`/api/inventory/items/${input.id}`, { method: 'PATCH', body: input }) as Promise<InventoryItem> }
  listLots(itemId: string) { return apiFetch(`/api/inventory/items/${itemId}/lots`) as Promise<InventoryLot[]> }
  listMovements(itemId: string, page = 1, pageSize = 10) { return apiFetch(`/api/inventory/items/${itemId}/movements`, { query: { page, pageSize } }) as Promise<InventoryPageResult<InventoryTransaction>> }
  recordMovement(input: InventoryMovementInput) { return apiFetch('/api/inventory/movements', { method: 'POST', body: input }) as Promise<InventoryTransaction> }
  getSummary() { return apiFetch('/api/inventory/summary') as Promise<InventorySummary> }
  listSuppliers(input: InventoryPageInput = {}) { return apiFetch('/api/inventory/suppliers', { query: toQuery({ ...input, pageSize: input.pageSize ?? 50 }) }) as Promise<InventoryPageResult<InventorySupplier>> }
  createSupplier(input: InventorySupplierMutationInput) { return apiFetch('/api/inventory/suppliers', { method: 'POST', body: input }) as Promise<InventorySupplier> }
  updateSupplier(input: InventorySupplierUpdateInput) { return apiFetch(`/api/inventory/suppliers/${input.id}`, { method: 'PATCH', body: input }) as Promise<InventorySupplier> }
}
