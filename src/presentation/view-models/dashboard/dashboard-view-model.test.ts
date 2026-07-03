import { describe, expect, it, vi } from 'vitest'
import { createDashboardViewModel } from './dashboard-view-model'

describe('createDashboardViewModel', () => {
  it('loads summary and appointments and exposes computed metrics', async () => {
    const viewModel = createDashboardViewModel({
      getDashboardSummaryUseCase: {
        execute: vi.fn().mockResolvedValue({
          totalToday: 6,
          completedToday: 2,
          pendingToday: 3,
          urgentToday: 1,
          activeConsultationLabel: '10:30',
        }),
      },
      getDashboardTodayAppointmentsUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'appointment_1',
            patientName: 'Ana Torres',
            serviceName: 'Consulta ORL',
            timeLabel: '09:00 - 09:30',
            status: 'scheduled',
            statusLabel: 'Programada',
            isUrgent: false,
          },
        ]),
      },
    })

    await viewModel.loadDashboard()

    expect(viewModel.summary.value?.totalToday).toBe(6)
    expect(viewModel.appointments.value).toHaveLength(1)
    expect(viewModel.metrics.value).toHaveLength(4)
    expect(viewModel.metrics.value[0]?.label).toBe('Hoy')
    expect(viewModel.activeConsultation.value).toBeNull()
  })

  it('derives the active consultation from the in-progress appointment', async () => {
    const viewModel = createDashboardViewModel({
      getDashboardSummaryUseCase: {
        execute: vi.fn().mockResolvedValue({
          totalToday: 4,
          completedToday: 1,
          pendingToday: 2,
          urgentToday: 0,
          activeConsultationLabel: '10:30',
        }),
      },
      getDashboardTodayAppointmentsUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'appointment_2',
            patientName: 'Maria Torres',
            serviceName: 'Consulta ginecologica',
            timeLabel: '10:30 - 11:00',
            startAt: '2026-06-19T10:30:00.000Z',
            endAt: '2026-06-19T11:00:00.000Z',
            status: 'in_progress',
            statusLabel: 'En curso',
            isUrgent: false,
          },
        ]),
      },
    })

    await viewModel.loadDashboard()

    expect(viewModel.activeConsultation.value).toEqual({
      appointmentId: 'appointment_2',
      patientName: 'Maria Torres',
      serviceName: 'Consulta ginecologica',
      timeLabel: '10:30 - 11:00',
      durationMinutes: 30,
    })
  })
})
