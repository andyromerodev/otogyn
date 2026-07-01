import { describe, expect, it } from 'vitest'
import { CreatePreEvaluationFormUseCase } from './create-pre-evaluation-form'
import { MockNotificationService } from '../../../infrastructure/mock/mock-notification-service'
import { MockPatientRepository } from '../../../infrastructure/mock/mock-patient-repository'
import { MockPreEvaluationFormRepository } from '../../../infrastructure/mock/mock-pre-evaluation-form-repository'
import type { CreatePreEvaluationFormInput } from '../../dto/pre-evaluation-form'
import type { Patient } from '../../../domain/entities/patient'

const ORG = 'org_1'

function makeInput(overrides: Partial<CreatePreEvaluationFormInput> = {}): CreatePreEvaluationFormInput {
  return {
    fullName: 'Maria Torres',
    phone: '987654321',
    email: 'maria@example.com',
    mainReasons: ['acidez_reflujo'],
    associatedSymptoms: [],
    aggravatingFactors: [],
    priorExams: [],
    alertSigns: [],
    consultationExpectations: [],
    consentInfoTruthful: true,
    consentUnderstandsNotConsultation: true,
    ...overrides,
  }
}

function makePatient(overrides: Partial<Patient> = {}): Patient {
  const now = new Date()
  return {
    id: 'patient_1',
    organizationId: ORG,
    fullName: 'Maria Torres',
    phone: '987654321',
    email: 'maria@example.com',
    birthDate: null,
    documentId: null,
    administrativeNotes: null,
    isUrgent: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  }
}

describe('CreatePreEvaluationFormUseCase', () => {
  it('links the form to an existing patient when phone and email match exactly', async () => {
    const patientRepo = new MockPatientRepository([makePatient()])
    const formRepo = new MockPreEvaluationFormRepository()
    const notificationService = new MockNotificationService()
    const useCase = new CreatePreEvaluationFormUseCase(patientRepo, formRepo, notificationService)

    const result = await useCase.execute({ organizationId: ORG, form: makeInput() })

    expect(formRepo.forms[0]?.patientId).toBe('patient_1')
    expect(result.id).toBeTruthy()
    expect(notificationService.calls[0]?.matchedPatient).toBe(true)
  })

  it('saves the form unlinked when no patient matches', async () => {
    const patientRepo = new MockPatientRepository([])
    const formRepo = new MockPreEvaluationFormRepository()
    const notificationService = new MockNotificationService()
    const useCase = new CreatePreEvaluationFormUseCase(patientRepo, formRepo, notificationService)

    await useCase.execute({ organizationId: ORG, form: makeInput({ phone: '111111111', email: null }) })

    expect(formRepo.forms[0]?.patientId).toBeNull()
  })

  it('does not throw when the notification email fails to send', async () => {
    const patientRepo = new MockPatientRepository([])
    const formRepo = new MockPreEvaluationFormRepository()
    const notificationService = new MockNotificationService()
    notificationService.shouldFail = true
    const useCase = new CreatePreEvaluationFormUseCase(patientRepo, formRepo, notificationService)

    const result = await useCase.execute({ organizationId: ORG, form: makeInput() })

    expect(result.id).toBeTruthy()
  })

  it('never returns the matched patient id in the result', async () => {
    const patientRepo = new MockPatientRepository([makePatient()])
    const formRepo = new MockPreEvaluationFormRepository()
    const notificationService = new MockNotificationService()
    const useCase = new CreatePreEvaluationFormUseCase(patientRepo, formRepo, notificationService)

    const result = await useCase.execute({ organizationId: ORG, form: makeInput() })

    expect(result).toEqual({ id: expect.any(String) })
  })
})
