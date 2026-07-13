import { HttpInventoryRemoteDataSource } from './remote/http-inventory-remote-data-source'
import { InventoryManagementRepositoryImpl } from './repositories/inventory-management-repository-impl'

const repository = new InventoryManagementRepositoryImpl(new HttpInventoryRemoteDataSource())

export const inventoryServiceLocator = {
  listItemsUseCase: { execute: (input: Parameters<typeof repository.listItems>[0]) => repository.listItems(input) },
  getItemUseCase: { execute: (itemId: string) => repository.getItem(itemId) },
  createItemUseCase: { execute: (input: Parameters<typeof repository.createItem>[0]) => repository.createItem(input) },
  updateItemUseCase: { execute: (input: Parameters<typeof repository.updateItem>[0]) => repository.updateItem(input) },
  listLotsUseCase: { execute: (itemId: string) => repository.listLots(itemId) },
  listMovementsUseCase: { execute: (itemId: string, page?: number, pageSize?: number) => repository.listMovements(itemId, page, pageSize) },
  recordMovementUseCase: { execute: (input: Parameters<typeof repository.recordMovement>[0]) => repository.recordMovement(input) },
  getSummaryUseCase: { execute: () => repository.getSummary() },
  listSuppliersUseCase: { execute: (input = {}) => repository.listSuppliers(input) },
  createSupplierUseCase: { execute: (input: Parameters<typeof repository.createSupplier>[0]) => repository.createSupplier(input) },
  updateSupplierUseCase: { execute: (input: Parameters<typeof repository.updateSupplier>[0]) => repository.updateSupplier(input) },
}
