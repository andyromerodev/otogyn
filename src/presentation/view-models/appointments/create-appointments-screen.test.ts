import { describe, expect, it, vi } from 'vitest'
import { createAppointmentsScreen } from './create-appointments-screen'

describe('createAppointmentsScreen', () => {
  it('loads patients, services and today appointments', async () => {
    const screen = createAppointmentsScreen({
      listAppointmentPatientsUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'patient_1',
            organizationId: 'org_1',
            fullName: 'Ana Torres',
            phone: '999888777',
            email: null,
            birthDate: null,
            documentId: null,
            administrativeNotes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ]),
      },
      listAppointmentServicesUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'service_1',
            organizationId: 'org_1',
            name: 'Consulta ORL',
            description: null,
            defaultDurationMinutes: 30,
            price: 120,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      },
      listTodayAppointmentsUseCase: {
        execute: vi.fn().mockResolvedValue([]),
      },
      createAppointmentUseCase: {
        execute: vi.fn(),
      },
    })

    await screen.loadScreenData()

    expect(screen.patients.value).toHaveLength(1)
    expect(screen.services.value).toHaveLength(1)
    expect(screen.form.patientId).toBe('patient_1')
    expect(screen.form.serviceId).toBe('service_1')
  })

  it('submits an appointment and refreshes the agenda', async () => {
    const listTodayAppointmentsUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'appointment_1',
            patientName: 'Ana Torres',
            serviceName: 'Consulta ORL',
            timeLabel: '09:00 - 09:30',
            status: 'scheduled' as const,
            statusLabel: 'Programada',
            isUrgent: false,
          },
        ]),
    }

    const screen = createAppointmentsScreen({
      listAppointmentPatientsUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'patient_1',
            organizationId: 'org_1',
            fullName: 'Ana Torres',
            phone: '999888777',
            email: null,
            birthDate: null,
            documentId: null,
            administrativeNotes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ]),
      },
      listAppointmentServicesUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'service_1',
            organizationId: 'org_1',
            name: 'Consulta ORL',
            description: null,
            defaultDurationMinutes: 30,
            price: 120,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      },
      listTodayAppointmentsUseCase,
      createAppointmentUseCase: {
        execute: vi.fn().mockResolvedValue({
          id: 'appointment_1',
          organizationId: 'org_1',
          patientId: 'patient_1',
          serviceId: 'service_1',
          professionalId: null,
          startAt: new Date(),
          endAt: new Date(),
          status: 'scheduled',
          isUrgent: false,
          reason: null,
          notes: null,
          createdBy: 'user_1',
          updatedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          cancelledAt: null,
        }),
      },
    })

    await screen.loadScreenData()
    screen.form.reason = 'Control'

    await screen.submitAppointment()

    expect(screen.successMessage.value).toBe('Cita registrada correctamente.')
    expect(screen.appointments.value).toHaveLength(1)
  })
})
