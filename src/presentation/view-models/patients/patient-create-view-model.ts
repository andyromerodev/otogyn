import { reactive, ref } from 'vue'
import type { Patient } from '~~/src/domain/entities/patient'
import { createInitialPatientForm } from './patient-view-model.types'
import type { PatientCreateViewModelDependencies } from './patient-create-view-model.module'

export type { PatientCreateViewModelDependencies } from './patient-create-view-model.module'

// Factory del ViewModel — equivale al constructor de PatientCreateViewModel : ViewModel()
export const createPatientCreateViewModel = (dependencies: PatientCreateViewModelDependencies) => {
  // Como StateFlow<Boolean> — la UI lo observa para deshabilitar el botón de submit
  const pending = ref(false)

  // Como StateFlow<String?> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras registrar al paciente
  const successMessage = ref<string | null>(null)

  // Como StateFlow<Patient?> — paciente recién creado, null hasta que el submit tiene éxito
  const createdPatient = ref<Patient | null>(null)

  // Como MutableStateFlow<PatientFormState> — estado mutable del formulario,
  // se resetea a valores vacíos tras un registro exitoso
  const form = reactive(createInitialPatientForm())

  // Equivale a fun onSubmitPatient() — lanza el UseCase y actualiza los StateFlows
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
