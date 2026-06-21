import { reactive, ref } from 'vue'
import type { Patient } from '~~/src/domain/entities/patient'
import type { PatientMutationInput } from '~~/src/application/dto/patient-management'
import { createInitialPatientForm, type PatientScreenPort } from './patient-screen.types'

export interface PatientCreateScreenDependencies {
  createPatientUseCase: PatientScreenPort<PatientMutationInput, Patient>
}

export const createPatientCreateScreen = (dependencies: PatientCreateScreenDependencies) => {
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const createdPatient = ref<Patient | null>(null)

  const form = reactive(createInitialPatientForm())

  const submitPatient = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      createdPatient.value = await dependencies.createPatientUseCase.execute({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email.trim() || null,
        birthDate: form.birthDate || null,
        documentId: form.documentId.trim() || null,
        administrativeNotes: form.administrativeNotes.trim() || null,
        isUrgent: form.isUrgent,
      })

      Object.assign(form, createInitialPatientForm())
      successMessage.value = 'Paciente registrado correctamente.'
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo registrar el paciente.'
    } finally {
      pending.value = false
    }
  }

  return {
    form,
    pending,
    errorMessage,
    successMessage,
    createdPatient,
    submitPatient,
  }
}
