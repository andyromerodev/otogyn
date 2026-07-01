import { describe, expect, it } from 'vitest'
import { DeleteServiceUseCase } from './delete-service'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import { appointments } from '../../infrastructure/database/schema'
import {
  seedTestOrganization,
  seedTestPatient,
  seedTestService,
  seedTestUser,
} from '../../infrastructure/database/test/fixtures'
import { withTestTransaction } from '../../infrastructure/database/test/test-db'
import { DrizzleServiceRepository } from '../../infrastructure/repositories/drizzle-service-repository'

// Verifica el foreign key restrict real de Postgres (appointments.service_id
// -> services.id): borrar un servicio con citas asociadas debe fallar con un
// BusinessRuleError legible, no con un error crudo de FK.
describe('DeleteServiceUseCase (integration)', () => {
  it('rechaza borrar un servicio con citas asociadas', async () => {
    await withTestTransaction(async (db) => {
      const org = await seedTestOrganization(db)
      const user = await seedTestUser(db)
      const patient = await seedTestPatient(db, org.id)
      const service = await seedTestService(db, org.id)

      const startAt = new Date('2099-05-01T14:00:00.000Z')
      const endAt = new Date(startAt.getTime() + service.defaultDurationMinutes * 60_000)

      await db.insert(appointments).values({
        organizationId: org.id,
        patientId: patient.id,
        serviceId: service.id,
        startAt,
        endAt,
        status: 'scheduled',
        createdBy: user.id,
      })

      // El DELETE fallido por el FK restrict aborta la transaccion de Postgres
      // en curso. Se ejecuta dentro de un SAVEPOINT (transaccion anidada) para
      // que el error quede contenido ahi y no envenene la transaccion de test
      // que envuelve todo el caso (necesaria para el rollback final).
      class SavepointRollback extends Error {}
      await db
        .transaction(async (savepointTx) => {
          const scopedRepository = new DrizzleServiceRepository(savepointTx)
          const scopedUseCase = new DeleteServiceUseCase(scopedRepository)

          await expect(
            scopedUseCase.execute({ serviceId: service.id, organizationId: org.id }),
          ).rejects.toThrow(BusinessRuleError)

          throw new SavepointRollback()
        })
        .catch((error) => {
          if (!(error instanceof SavepointRollback)) throw error
        })

      const serviceRepository = new DrizzleServiceRepository(db)
      const stillExists = await serviceRepository.findById(service.id)
      expect(stillExists).not.toBeNull()
    })
  })

  it('permite borrar un servicio sin citas asociadas', async () => {
    await withTestTransaction(async (db) => {
      const org = await seedTestOrganization(db)
      const service = await seedTestService(db, org.id)

      const serviceRepository = new DrizzleServiceRepository(db)
      const useCase = new DeleteServiceUseCase(serviceRepository)

      await useCase.execute({ serviceId: service.id, organizationId: org.id })

      const deleted = await serviceRepository.findById(service.id)
      expect(deleted).toBeNull()
    })
  })
})
