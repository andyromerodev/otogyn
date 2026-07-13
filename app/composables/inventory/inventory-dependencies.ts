import { inventoryServiceLocator } from '~~/src/infrastructure/inventory/service-locator'
import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import type { InventoryViewModelDependencies } from '~~/src/presentation/view-models/inventory/inventory-view-models'

export const inventoryViewModelDependencies: InventoryViewModelDependencies = {
  listItems: (input) => inventoryServiceLocator.listItemsUseCase.execute(input),
  getItem: (itemId) => inventoryServiceLocator.getItemUseCase.execute(itemId),
  createItem: (input) => inventoryServiceLocator.createItemUseCase.execute(input),
  updateItem: (input) => inventoryServiceLocator.updateItemUseCase.execute(input),
  listLots: (itemId) => inventoryServiceLocator.listLotsUseCase.execute(itemId),
  listMovements: (itemId, page, pageSize) => inventoryServiceLocator.listMovementsUseCase.execute(itemId, page, pageSize),
  recordMovement: (input) => inventoryServiceLocator.recordMovementUseCase.execute(input),
  getSummary: () => inventoryServiceLocator.getSummaryUseCase.execute(),
  listSuppliers: (input) => inventoryServiceLocator.listSuppliersUseCase.execute(input),
  createSupplier: (input) => inventoryServiceLocator.createSupplierUseCase.execute(input),
  updateSupplier: (input) => inventoryServiceLocator.updateSupplierUseCase.execute(input),
  listAppointments: (input) => appointmentServiceLocator.listAppointmentsUseCase.execute({ search: input.search, page: input.page, pageSize: input.pageSize }),
}
