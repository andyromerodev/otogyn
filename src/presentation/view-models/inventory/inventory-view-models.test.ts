import { describe, expect, it, vi } from 'vitest'
import type { InventoryViewModelDependencies } from './inventory-view-models'
import { createInventoryListViewModel, createInventoryMovementViewModel } from './inventory-view-models'

const item = {
  id: 'item-1', organizationId: 'org-1', name: 'Guantes', sku: 'GUA-1', barcode: null, description: null,
  unit: 'par', minimumStock: 5, expiryAlertDays: 30, isActive: true, createdAt: new Date(), updatedAt: new Date(),
  usableStock: 3, physicalStock: 3, nextExpiry: null, status: 'low_stock' as const,
}

const dependencies = (): InventoryViewModelDependencies => ({
  listItems: vi.fn().mockResolvedValue({ items: [item], total: 1, page: 1, pageSize: 10, totalPages: 1 }),
  getItem: vi.fn().mockResolvedValue(item),
  createItem: vi.fn(), updateItem: vi.fn(), listLots: vi.fn().mockResolvedValue([]),
  listMovements: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 }),
  recordMovement: vi.fn().mockResolvedValue({}),
  getSummary: vi.fn().mockResolvedValue({ activeItems: 1, lowStockItems: 1, outOfStockItems: 0, expiringItems: 0, expiredLots: 0 }),
  listSuppliers: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 1 }),
  createSupplier: vi.fn(), updateSupplier: vi.fn(),
})

describe('inventory view models', () => {
  it('carga resumen, lista y aplica un filtro en el servidor', async () => {
    const deps = dependencies()
    const vm = createInventoryListViewModel(deps, true)
    await vm.load()
    await vm.selectStatus('low_stock')
    expect(vm.items.value).toEqual([item])
    expect(vm.summary.value?.lowStockItems).toBe(1)
    expect(deps.listItems).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'low_stock', page: 1 }))
  })

  it('oculta ajustes para asistente y registra un consumo', async () => {
    const deps = dependencies()
    const vm = createInventoryMovementViewModel(deps, false, item.id)
    await vm.load()
    vm.form.type = 'consumption'
    vm.form.quantity = 2
    await vm.submit()
    expect(vm.canManage).toBe(false)
    expect(deps.recordMovement).toHaveBeenCalledWith(expect.objectContaining({ type: 'consumption', itemId: item.id, quantity: 2 }))
    expect(vm.successMessage.value).toContain('stock actualizado')
  })
})
