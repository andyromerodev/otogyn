import { describe, expect, it } from 'vitest'
import { CreatePublicBookingUseCase } from './create-public-booking'
import { ScheduleAppointmentUseCase } from '../schedule-appointment'
import { doctorAvailability } from '../../../infrastructure/database/schema'
import {
  seedTestOrganization,
  seedTestService,
  seedTestUser,
} from '../../../infrastructure/database/test/fixtures'
import { withTestTransaction } from '../../../infrastructure/database/test/test-db'
import { DrizzleAppointmentRepository } from '../../../infrastructure/repositories/drizzle-appointment-repository'
import { DrizzleAvailabilityRepository } from '../../../infrastructure/repositories/drizzle-availability-repository'
import { DrizzlePatientRepository } from '../../../infrastructure/repositories/drizzle-patient-repository'
import { DrizzleServiceRepository } from '../../../infrastructure/repositories/drizzle-service-repository'

// Cubre el flujo real del formulario publico de reserva: crea un paciente
// nuevo y una cita en la misma operacion, contra Postgres real.
describe('CreatePublicBookingUseCase (integration)', () => {
  it('crea el paciente y la cita a partir de datos publicos', async () => {
    await withTestTransaction(async (db) => {
      const org = await seedTestOrganization(db)
      const systemUser = await seedTestUser(db)
      const service = await seedTestService(db, org.id, { defaultDurationMinutes: 45, isActive: true })

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

      const scheduleAppointmentUseCase = new ScheduleAppointmentUseCase(
        appointmentRepository,
        patientRepository,
        serviceRepository,
        availabilityRepository,
      )

      const useCase = new CreatePublicBookingUseCase(
        patientRepository,
        serviceRepository,
        scheduleAppointmentUseCase,
      )

      const result = await useCase.execute({
        organizationId: org.id,
        systemUserId: systemUser.id,
        booking: {
          serviceId: service.id,
          startAt: '2099-04-05T16:00:00.000Z',
          patientName: 'Paciente Publico',
          patientPhone: '987654321',
          patientEmail: 'paciente.publico@test.otogyn.test',
          reason: 'Consulta general',
        },
      })

      expect(result.appointmentId).toBeDefined()
      expect(result.serviceName).toBe(service.name)
      expect(result.durationMinutes).toBe(45)

      const patients = await patientRepository.listPage({
        organizationId: org.id,
        search: 'Paciente Publico',
        filter: 'all',
        page: 1,
        pageSize: 10,
      })

      expect(patients.items.some((p) => p.fullName === 'Paciente Publico')).toBe(true)
    })
  })
})
