import { describe, expect, it, vi } from 'vitest'
import { createAppointmentsScreen } from './create-appointments-screen'

describe('createAppointmentsScreen', () => {
  const buildDependencies = () => ({
    getAppointmentSessionContextUseCase: {
      execute: vi.fn().mockResolvedValue({
        role: 'admin_doctor' as const,
      }),
    },
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
    updateAppointmentUseCase: {
      execute: vi.fn(),
    },
    cancelAppointmentUseCase: {
      execute: vi.fn(),
    },
    changeAppointmentStatusUseCase: {
      execute: vi.fn(),
    },
  })

  it('loads patients, services and today appointments', async () => {
    const screen = createAppointmentsScreen(buildDependencies())

    await screen.loadScreenData()

    expect(screen.sessionRole.value).toBe('admin_doctor')
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
            patientId: 'patient_1',
            serviceId: 'service_1',
            professionalId: null,
            patientName: 'Ana Torres',
            serviceName: 'Consulta ORL',
            startAt: new Date().toISOString(),
            endAt: new Date().toISOString(),
            timeLabel: '09:00 - 09:30',
            status: 'scheduled' as const,
            statusLabel: 'Programada',
            isUrgent: false,
            reason: null,
            notes: null,
          },
        ]),
    }

    const screen = createAppointmentsScreen({
      ...buildDependencies(),
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

  it('starts editing an appointment and updates it', async () => {
    const updateAppointmentUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'appointment_1',
      }),
    }

    const screen = createAppointmentsScreen({
      ...buildDependencies(),
      updateAppointmentUseCase,
      listTodayAppointmentsUseCase: {
        execute: vi
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'appointment_1',
              patientId: 'patient_1',
              serviceId: 'service_1',
              professionalId: null,
              patientName: 'Ana Torres',
              serviceName: 'Consulta ORL',
              startAt: '2026-06-17T14:00:00.000Z',
              endAt: '2026-06-17T14:30:00.000Z',
              timeLabel: '09:00 - 09:30',
              status: 'scheduled' as const,
              statusLabel: 'Programada',
              isUrgent: false,
              reason: 'Control',
              notes: 'Nota',
            },
          ])
          .mockResolvedValueOnce([]),
      },
    })

    await screen.loadScreenData()
    screen.startEditingAppointment(screen.appointments.value[0]!)
    screen.form.reason = 'Reprogramada'

    await screen.submitAppointment()

    expect(updateAppointmentUseCase.execute).toHaveBeenCalledWith('appointment_1', expect.objectContaining({
      reason: 'Reprogramada',
    }))
    expect(screen.successMessage.value).toBe('Cita actualizada correctamente.')
    expect(screen.editingAppointmentId.value).toBeNull()
  })

  it('cancels an appointment and refreshes the agenda', async () => {
    const cancelAppointmentUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    }

    const screen = createAppointmentsScreen({
      ...buildDependencies(),
      cancelAppointmentUseCase,
      listTodayAppointmentsUseCase: {
        execute: vi
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'appointment_1',
              patientId: 'patient_1',
              serviceId: 'service_1',
              professionalId: null,
              patientName: 'Ana Torres',
              serviceName: 'Consulta ORL',
              startAt: '2026-06-17T14:00:00.000Z',
              endAt: '2026-06-17T14:30:00.000Z',
              timeLabel: '09:00 - 09:30',
              status: 'scheduled' as const,
              statusLabel: 'Programada',
              isUrgent: false,
              reason: null,
              notes: null,
            },
          ])
          .mockResolvedValueOnce([]),
      },
    })

    await screen.loadScreenData()

    await screen.submitAppointmentCancellation(screen.appointments.value[0]!)

    expect(cancelAppointmentUseCase.execute).toHaveBeenCalledWith('appointment_1')
    expect(screen.successMessage.value).toBe('Cita cancelada correctamente.')
  })
})
