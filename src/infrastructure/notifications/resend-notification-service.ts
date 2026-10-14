import { Resend } from 'resend'
import type { PreEvaluationForm } from '../../domain/entities/pre-evaluation-form'
import type { NotificationService } from '../../application/ports/notification-service'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export class ResendNotificationService implements NotificationService {
  private readonly resend: Resend | null

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    this.resend = apiKey ? new Resend(apiKey) : null
  }

  async notifyPreEvaluationFormSubmission(
    form: PreEvaluationForm,
    matchedPatient: boolean,
  ): Promise<void> {
    const to = process.env.CLINIC_NOTIFICATION_EMAIL

    if (!this.resend || !to) {
      console.error(
        'RESEND_API_KEY or CLINIC_NOTIFICATION_EMAIL is not configured; skipping pre-evaluation form email notification.',
      )
      return
    }

    try {
      const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

      await this.resend.emails.send({
        from,
        to,
        subject: `Nuevo formulario de pre-evaluacion: ${form.fullName}`,
        html: `
          <p>Se recibio un nuevo formulario de pre-evaluacion.</p>
          <ul>
            <li><strong>Nombre:</strong> ${escapeHtml(form.fullName)}</li>
            <li><strong>WhatsApp:</strong> ${escapeHtml(form.phone)}</li>
            <li><strong>Email:</strong> ${form.email ? escapeHtml(form.email) : '(no proporcionado)'}</li>
            <li><strong>Ciudad / Pais:</strong> ${form.residenceCityCountry ? escapeHtml(form.residenceCityCountry) : (form.city ? escapeHtml(form.city) : '(no proporcionada)')}</li>
            <li><strong>Motivo de consulta:</strong> ${form.complaintDescription ? escapeHtml(form.complaintDescription) : '(no especificado)'}</li>
            <li><strong>Comprende atencion virtual:</strong> ${form.understandsVirtualConditions ? 'Si' : 'No'}</li>
            <li><strong>Paciente existente vinculado:</strong> ${matchedPatient ? 'Si' : 'No'}</li>
          </ul>
        `,
      })
    } catch (error) {
      console.error('Resend failed to send pre-evaluation form notification email', error)
    }
  }
}
