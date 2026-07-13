import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { InventoryRepository } from '../../../domain/repositories/inventory-repository'
import type {
  InventoryItemMutationInput,
  InventoryItemUpdateInput,
  InventoryMovementInput,
  InventoryPageInput,
  InventorySupplierMutationInput,
  InventorySupplierUpdateInput,
} from '../../dto/inventory-management'

const validateItem = (input: InventoryItemMutationInput) => {
  if (!input.name.trim()) throw new BusinessRuleError('El nombre del insumo es obligatorio.')
  if (!input.sku.trim()) throw new BusinessRuleError('El SKU del insumo es obligatorio.')
  if (!input.unit.trim()) throw new BusinessRuleError('La unidad base es obligatoria.')
  if (input.minimumStock < 0) throw new BusinessRuleError('El stock mínimo no puede ser negativo.')
  if (!Number.isInteger(input.expiryAlertDays) || input.expiryAlertDays < 0 || input.expiryAlertDays > 3650) {
    throw new BusinessRuleError('Los días de alerta deben estar entre 0 y 3650.')
  }
}

export class ListInventoryItemsUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  execute(input: InventoryPageInput & { organizationId: string }) {
    return this.repository.listItems(input.organizationId, input)
  }
}

export class GetInventoryItemUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  async execute(input: { organizationId: string, itemId: string }) {
    const item = await this.repository.findItemById(input.organizationId, input.itemId)
    if (!item) throw new BusinessRuleError('Insumo no encontrado.')
    return item
  }
}

export class CreateInventoryItemUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  execute(input: InventoryItemMutationInput & { organizationId: string }) {
    validateItem(input)
    return this.repository.createItem(input.organizationId, input)
  }
}

export class UpdateInventoryItemUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  async execute(input: InventoryItemUpdateInput & { organizationId: string }) {
    const current = await this.repository.findItemById(input.organizationId, input.id)
    if (!current) throw new BusinessRuleError('Insumo no encontrado.')
    validateItem({
      name: input.name ?? current.name,
      sku: input.sku ?? current.sku,
      barcode: input.barcode ?? current.barcode,
      description: input.description ?? current.description,
      unit: input.unit ?? current.unit,
      minimumStock: input.minimumStock ?? current.minimumStock,
      expiryAlertDays: input.expiryAlertDays ?? current.expiryAlertDays,
      isActive: input.isActive ?? current.isActive,
    })
    return this.repository.updateItem(input.organizationId, input)
  }
}

export class GetInventoryItemLotsUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  execute(input: { organizationId: string, itemId: string }) {
    return this.repository.listLots(input.organizationId, input.itemId)
  }
}

export class ListInventoryMovementsUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  execute(input: { organizationId: string, itemId: string, page?: number, pageSize?: number }) {
    return this.repository.listMovements(
      input.organizationId,
      input.itemId,
      input.page ?? 1,
      input.pageSize ?? 10,
    )
  }
}

export class RecordInventoryMovementUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  execute(input: InventoryMovementInput & { organizationId: string, createdBy: string }) {
    if (input.quantity <= 0) throw new BusinessRuleError('La cantidad debe ser mayor a cero.')
    if (input.type === 'entry' && !input.lotNumber.trim()) {
      throw new BusinessRuleError('El número de lote es obligatorio para una entrada.')
    }
    if ((input.type === 'adjustment_in' || input.type === 'adjustment_out') && !input.reason.trim()) {
      throw new BusinessRuleError('El motivo del ajuste es obligatorio.')
    }
    return this.repository.recordMovement(input)
  }
}

export class GetInventorySummaryUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  execute(input: { organizationId: string }) {
    return this.repository.getSummary(input.organizationId)
  }
}

export class ListInventorySuppliersUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  execute(input: InventoryPageInput & { organizationId: string }) {
    return this.repository.listSuppliers(input.organizationId, input)
  }
}

export class CreateInventorySupplierUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  execute(input: InventorySupplierMutationInput & { organizationId: string }) {
    if (!input.name.trim()) throw new BusinessRuleError('El nombre del proveedor es obligatorio.')
    return this.repository.createSupplier(input.organizationId, input)
  }
}

export class UpdateInventorySupplierUseCase {
  constructor(private readonly repository: InventoryRepository) {}
  async execute(input: InventorySupplierUpdateInput & { organizationId: string }) {
    const supplier = await this.repository.findSupplierById(input.organizationId, input.id)
    if (!supplier) throw new BusinessRuleError('Proveedor no encontrado.')
    if (input.name !== undefined && !input.name.trim()) {
      throw new BusinessRuleError('El nombre del proveedor es obligatorio.')
    }
    return this.repository.updateSupplier(input.organizationId, input)
  }
}
