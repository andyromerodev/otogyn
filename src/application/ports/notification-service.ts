import type { PreEvaluationForm } from '../../domain/entities/pre-evaluation-form'

export interface NotificationService {
  notifyPreEvaluationFormSubmission(form: PreEvaluationForm, matchedPatient: boolean): Promise<void>
}
