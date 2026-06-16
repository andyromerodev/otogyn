import { reactive, ref } from 'vue'
import type { Patient } from '../../../domain/entities/patient'
import type { PatientMutationInput } from '../../../application/dto/patient-management'

export interface PatientScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface PatientsScreenDependencies {
  listPatientsUseCase: { execute(): Promise<Patient[]> }
  createPatientUseCase: PatientScreenPort<PatientMutationInput, Patient>
}

const createInitialForm = () => ({
  fullName: '',
  phone: '',
  email: '',
  birthDate: '',
  documentId: '',
  administrativeNotes: '',
})

export const createPatientsScreen = (dependencies: PatientsScreenDependencies) => {
  const patients = ref<Patient[]>([])
  const loading = ref(false)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const form = reactive(createInitialForm())

  const loadPatients = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      patients.value = await dependencies.listPatientsUseCase.execute()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar la lista de pacientes.'
    } finally {
      loading.value = false
    }
  }

  const submitPatient = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.createPatientUseCase.execute({
        fullName: form.fullName,
        phone: form.phone,
        email: form.email.trim() || null,
        birthDate: form.birthDate || null,
        documentId: form.documentId.trim() || null,
        administrativeNotes: form.administrativeNotes.trim() || null,
      })

      Object.assign(form, createInitialForm())
      successMessage.value = 'Paciente registrado correctamente.'
      await loadPatients()
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
    patients,
    form,
    loading,
    pending,
    errorMessage,
    successMessage,
    loadPatients,
    submitPatient,
  }
}
