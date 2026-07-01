import { describe, expect, it } from 'vitest'
import { ScheduleAppointmentUseCase } from './schedule-appointment'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'
import { doctorAvailability } from '../../infrastructure/database/schema'
import {
  seedTestOrganization,
  seedTestPatient,
  seedTestService,
  seedTestUser,
} from '../../infrastructure/database/test/fixtures'
import { withTestTransaction } from '../../infrastructure/database/test/test-db'
import { DrizzleAppointmentRepository } from '../../infrastructure/repositories/drizzle-appointment-repository'
import { DrizzleAvailabilityRepository } from '../../infrastructure/repositories/drizzle-availability-repository'
import { DrizzlePatientRepository } from '../../infrastructure/repositories/drizzle-patient-repository'
import { DrizzleServiceRepository } from '../../infrastructure/repositories/drizzle-service-repository'

// Verifica el flujo real UseCase -> Repository -> Postgres, incluyendo el
// constraint EXCLUDE de la migracion 0004 contra doble reserva. A diferencia
// del test unitario (repos mockeados), aqui una query mal escrita o un
// constraint roto SI harian fallar el test.
describe('ScheduleAppointmentUseCase (integration)', () => {
  it('persiste una cita valida y rechaza una que se solapa', async () => {
    await withTestTransaction(async (db) => {
      const org = await seedTestOrganization(db)
      const user = await seedTestUser(db)
      const patient = await seedTestPatient(db, org.id)
      const service = await seedTestService(db, org.id, { defaultDurationMinutes: 30 })

      const startAt = new Date('2099-03-10T15:00:00.000Z')

      // getDay()/getHours() en ScheduleAppointmentUseCase usan hora local del
      // proceso que corre el test, no UTC. Para no depender del timezone de
      // quien ejecute los tests, se cubre el dia completo para los 7 dias.
      await db.insert(doctorAvailability).values(
        [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
          organizationId: org.id,
          weekday,
          startTime: '00:00',
          endTime: '23:59',
          isActive: true,
        })),
      )

      const appointmentRepository = new DrizzleAppointmentRepository(db)
      const patientRepository = new DrizzlePatientRepository(db)
      const serviceRepository = new DrizzleServiceRepository(db)
      const availabilityRepository = new DrizzleAvailabilityRepository(db)

      const useCase = new ScheduleAppointmentUseCase(
        appointmentRepository,
        patientRepository,
        serviceRepository,
        availabilityRepository,
      )

      const endAt = new Date(startAt.getTime() + service.defaultDurationMinutes * 60_000)

      const created = await useCase.execute({
        id: crypto.randomUUID(),
        organizationId: org.id,
        patientId: patient.id,
        serviceId: service.id,
        professionalId: null,
        startAt,
        endAt,
        status: 'scheduled',
        isUrgent: false,
        reason: null,
        notes: null,
        createdBy: user.id,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        cancelledAt: null,
      })

      expect(created.id).toBeDefined()

      const overlappingStart = new Date(startAt.getTime() + 15 * 60_000)
      const overlappingEnd = new Date(overlappingStart.getTime() + service.defaultDurationMinutes * 60_000)

      await expect(
        useCase.execute({
          id: crypto.randomUUID(),
          organizationId: org.id,
          patientId: patient.id,
          serviceId: service.id,
          professionalId: null,
          startAt: overlappingStart,
          endAt: overlappingEnd,
          status: 'scheduled',
          isUrgent: false,
          reason: null,
          notes: null,
          createdBy: user.id,
          updatedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          cancelledAt: null,
        }),
      ).rejects.toThrow(BusinessRuleError)
    })
  })
})
