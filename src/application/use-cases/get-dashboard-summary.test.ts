import { describe, expect, it } from 'vitest'
import { GetDashboardSummaryUseCase } from './get-dashboard-summary'
import { demoAppointments, demoOrganization } from '../../infrastructure/mock/demo-data'
import { MockAppointmentRepository } from '../../infrastructure/mock/mock-appointment-repository'

describe('GetDashboardSummaryUseCase', () => {
  it('returns aggregated daily metrics from the repository', async () => {
    const repository = new MockAppointmentRepository([...demoAppointments])
    const useCase = new GetDashboardSummaryUseCase(repository)

    const summary = await useCase.execute({
      organizationId: demoOrganization.id,
      day: new Date(),
    })

    expect(summary.totalToday).toBe(6)
    expect(summary.completedToday).toBe(1)
    expect(summary.pendingToday).toBe(4)
    expect(summary.urgentToday).toBe(1)
    expect(summary.activeConsultationLabel).not.toBeNull()
  })
})
