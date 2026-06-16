import { reactive, ref } from 'vue'
import type { Patient } from '../../../domain/entities/patient'
import type { UpdatePatientDetailInput } from '../../../application/dto/patient-management'
import type { PatientScreenPort } from './create-patients-screen'

export interface PatientDetailScreenDependencies {
  patientId: string
  getPatientDetailUseCase: { execute(input: { patientId: string }): Promise<Patient> }
  updatePatientUseCase: PatientScreenPort<UpdatePatientDetailInput, Patient>
}

const createInitialForm = () => ({
  fullName: '',
  phone: '',
  email: '',
  birthDate: '',
  documentId: '',
  administrativeNotes: '',
})

export const createPatientDetailScreen = (dependencies: PatientDetailScreenDependencies) => {
  const patient = ref<Patient | null>(null)
  const loading = ref(false)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const form = reactive(createInitialForm())

  const syncForm = (value: Patient) => {
    form.fullName = value.fullName
    form.phone = value.phone
    form.email = value.email ?? ''
    form.birthDate = value.birthDate ?? ''
    form.documentId = value.documentId ?? ''
    form.administrativeNotes = value.administrativeNotes ?? ''
  }

  const loadPatient = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      patient.value = await dependencies.getPatientDetailUseCase.execute({
        patientId: dependencies.patientId,
      })
      syncForm(patient.value)
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el paciente.'
    } finally {
      loading.value = false
    }
  }

  const submitPatient = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      patient.value = await dependencies.updatePatientUseCase.execute({
        patientId: dependencies.patientId,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email.trim() || null,
        birthDate: form.birthDate || null,
        documentId: form.documentId.trim() || null,
        administrativeNotes: form.administrativeNotes.trim() || null,
      })

      if (patient.value) {
        syncForm(patient.value)
      }

      successMessage.value = 'Paciente actualizado correctamente.'
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo actualizar el paciente.'
    } finally {
      pending.value = false
    }
  }

  return {
    patient,
    form,
    loading,
    pending,
    errorMessage,
    successMessage,
    loadPatient,
    submitPatient,
  }
}
