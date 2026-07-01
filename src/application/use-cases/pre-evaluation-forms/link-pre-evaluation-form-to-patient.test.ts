import { describe, expect, it } from 'vitest'
import { LinkPreEvaluationFormToPatientUseCase } from './link-pre-evaluation-form-to-patient'
import { MockPatientRepository } from '../../../infrastructure/mock/mock-patient-repository'
import { MockPreEvaluationFormRepository } from '../../../infrastructure/mock/mock-pre-evaluation-form-repository'
import type { Patient } from '../../../domain/entities/patient'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'

const ORG = 'org_1'
const OTHER_ORG = 'org_2'

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

function makeForm(overrides: Partial<PreEvaluationForm> = {}): PreEvaluationForm {
  const now = new Date()
  return {
    id: 'form_1',
    organizationId: ORG,
    patientId: null,
    fullName: 'Maria Torres',
    age: null,
    city: null,
    phone: '987654321',
    email: 'maria@example.com',
    mainReasons: [],
    mainReasonOtherText: null,
    complaintDescription: null,
    symptomDuration: null,
    symptomPattern: null,
    associatedSymptoms: [],
    aggravatingFactors: [],
    hasPriorRefluxDiagnosis: null,
    hasPriorTreatment: null,
    priorMedicationUsed: null,
    treatmentImprovement: null,
    priorExams: [],
    attachmentKeys: [],
    alertSigns: [],
    consultationExpectations: [],
    consentInfoTruthful: true,
    consentUnderstandsNotConsultation: true,
    status: 'pending_review',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('LinkPreEvaluationFormToPatientUseCase', () => {
  it('links the form to the given patient and marks it reviewed', async () => {
    const formRepo = new MockPreEvaluationFormRepository([makeForm()])
    const patientRepo = new MockPatientRepository([makePatient()])
    const useCase = new LinkPreEvaluationFormToPatientUseCase(formRepo, patientRepo)

    const result = await useCase.execute({ formId: 'form_1', patientId: 'patient_1', organizationId: ORG })

    expect(result.patientId).toBe('patient_1')
    expect(result.status).toBe('reviewed')
  })

  it('rejects when the form does not exist', async () => {
    const formRepo = new MockPreEvaluationFormRepository([])
    const patientRepo = new MockPatientRepository([makePatient()])
    const useCase = new LinkPreEvaluationFormToPatientUseCase(formRepo, patientRepo)

    await expect(
      useCase.execute({ formId: 'missing', patientId: 'patient_1', organizationId: ORG }),
    ).rejects.toThrow('Pre-evaluation form not found.')
  })

  it('rejects when the patient belongs to a different organization', async () => {
    const formRepo = new MockPreEvaluationFormRepository([makeForm()])
    const patientRepo = new MockPatientRepository([makePatient({ organizationId: OTHER_ORG })])
    const useCase = new LinkPreEvaluationFormToPatientUseCase(formRepo, patientRepo)

    await expect(
      useCase.execute({ formId: 'form_1', patientId: 'patient_1', organizationId: ORG }),
    ).rejects.toThrow('Patient not found.')
  })
})
