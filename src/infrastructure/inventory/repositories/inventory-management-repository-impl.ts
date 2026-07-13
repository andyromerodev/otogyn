import type { InventoryManagementRepository } from '../../../application/ports/inventory-management-repository'
import type { InventoryRemoteDataSource } from '../remote/inventory-remote-data-source'

export class InventoryManagementRepositoryImpl implements InventoryManagementRepository {
  constructor(private readonly remote: InventoryRemoteDataSource) {}
  listItems(input: Parameters<InventoryRemoteDataSource['listItems']>[0]) { return this.remote.listItems(input) }
  getItem(itemId: string) { return this.remote.getItem(itemId) }
  createItem(input: Parameters<InventoryRemoteDataSource['createItem']>[0]) { return this.remote.createItem(input) }
  updateItem(input: Parameters<InventoryRemoteDataSource['updateItem']>[0]) { return this.remote.updateItem(input) }
  listLots(itemId: string) { return this.remote.listLots(itemId) }
  listMovements(itemId: string, page?: number, pageSize?: number) { return this.remote.listMovements(itemId, page, pageSize) }
  recordMovement(input: Parameters<InventoryRemoteDataSource['recordMovement']>[0]) { return this.remote.recordMovement(input) }
  getSummary() { return this.remote.getSummary() }
  listSuppliers(input = {}) { return this.remote.listSuppliers(input) }
  createSupplier(input: Parameters<InventoryRemoteDataSource['createSupplier']>[0]) { return this.remote.createSupplier(input) }
  updateSupplier(input: Parameters<InventoryRemoteDataSource['updateSupplier']>[0]) { return this.remote.updateSupplier(input) }
}
