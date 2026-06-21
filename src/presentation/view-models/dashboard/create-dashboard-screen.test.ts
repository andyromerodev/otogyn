import { describe, expect, it, vi } from 'vitest'
import { createDashboardScreen } from './create-dashboard-screen'

describe('createDashboardScreen', () => {
  it('loads summary and appointments and exposes computed metrics', async () => {
    const screen = createDashboardScreen({
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

    await screen.loadDashboard()

    expect(screen.summary.value?.totalToday).toBe(6)
    expect(screen.appointments.value).toHaveLength(1)
    expect(screen.metrics.value).toHaveLength(4)
    expect(screen.metrics.value[0]?.label).toBe('Hoy')
    expect(screen.activeConsultation.value).toBeNull()
  })

  it('derives the active consultation from the in-progress appointment', async () => {
    const screen = createDashboardScreen({
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

    await screen.loadDashboard()

    expect(screen.activeConsultation.value).toEqual({
      patientName: 'Maria Torres',
      serviceName: 'Consulta ginecologica',
      timeLabel: '10:30 - 11:00',
      durationMinutes: 30,
    })
  })
})
