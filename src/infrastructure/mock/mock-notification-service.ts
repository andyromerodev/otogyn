import type { PreEvaluationForm } from '../../domain/entities/pre-evaluation-form'
import type { NotificationService } from '../../application/ports/notification-service'

export class MockNotificationService implements NotificationService {
  public readonly calls: { form: PreEvaluationForm; matchedPatient: boolean }[] = []
  public shouldFail = false

  async notifyPreEvaluationFormSubmission(
    form: PreEvaluationForm,
    matchedPatient: boolean,
  ): Promise<void> {
    if (this.shouldFail) {
      throw new Error('Simulated email failure')
    }
    this.calls.push({ form, matchedPatient })
  }
}
