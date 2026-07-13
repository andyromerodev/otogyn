import { describe, expect, it } from 'vitest'
import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import { seedTestOrganization, seedTestUser } from '../../../infrastructure/database/test/fixtures'
import { withTestTransaction } from '../../../infrastructure/database/test/test-db'
import { DrizzleInventoryRepository } from '../../../infrastructure/repositories/drizzle-inventory-repository'

describe('Inventory repository (integration)', () => {
  it('registra entradas y consume varios lotes mediante FEFO', async () => {
    await withTestTransaction(async (db) => {
      const organization = await seedTestOrganization(db)
      const user = await seedTestUser(db)
      const repository = new DrizzleInventoryRepository(db)
      const item = await repository.createItem(organization.id, {
        name: 'Guantes', sku: 'TEST-GUA', unit: 'par', minimumStock: 2, expiryAlertDays: 30,
      })
      await repository.recordMovement({ organizationId: organization.id, createdBy: user.id, itemId: item.id, type: 'entry', quantity: 2, lotNumber: 'PRIMERO', expiresOn: '2099-02-01' })
      await repository.recordMovement({ organizationId: organization.id, createdBy: user.id, itemId: item.id, type: 'entry', quantity: 5, lotNumber: 'SEGUNDO', expiresOn: '2099-03-01' })

      const movement = await repository.recordMovement({ organizationId: organization.id, createdBy: user.id, itemId: item.id, type: 'consumption', quantity: 4 })
      expect(movement.allocations.map((allocation) => [allocation.lotNumber, allocation.quantityDelta])).toEqual([
        ['PRIMERO', -2], ['SEGUNDO', -2],
      ])
      const detail = await repository.findItemById(organization.id, item.id)
      expect(detail?.usableStock).toBe(3)
    })
  })

  it('rechaza stock insuficiente sin dejar cambios parciales', async () => {
    await withTestTransaction(async (db) => {
      const organization = await seedTestOrganization(db)
      const user = await seedTestUser(db)
      const repository = new DrizzleInventoryRepository(db)
      const item = await repository.createItem(organization.id, { name: 'Gasas', sku: 'TEST-GAS', unit: 'unidad', minimumStock: 0, expiryAlertDays: 30 })
      await repository.recordMovement({ organizationId: organization.id, createdBy: user.id, itemId: item.id, type: 'entry', quantity: 1, lotNumber: 'LOTE-1' })
      await expect(repository.recordMovement({ organizationId: organization.id, createdBy: user.id, itemId: item.id, type: 'consumption', quantity: 2 })).rejects.toThrow(BusinessRuleError)
      expect((await repository.findItemById(organization.id, item.id))?.usableStock).toBe(1)
    })
  })

  it('aísla insumos por organización', async () => {
    await withTestTransaction(async (db) => {
      const first = await seedTestOrganization(db)
      const second = await seedTestOrganization(db)
      const repository = new DrizzleInventoryRepository(db)
      const item = await repository.createItem(first.id, { name: 'Algodón', sku: 'TEST-ALG', unit: 'g', minimumStock: 0, expiryAlertDays: 30 })
      expect(await repository.findItemById(second.id, item.id)).toBeNull()
    })
  })
})
