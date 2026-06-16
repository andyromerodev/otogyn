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
    expect(screen.metrics.value[0]?.label).toBe('Pacientes hoy')
  })
})
