import { reactive, ref } from 'vue'
import type { Appointment } from '../../../domain/entities/appointment'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import { createInitialAppointmentForm, normalizeApiError } from './appointment-view-model.types'
import type { AppointmentCreateViewModelDependencies } from './appointment-create-view-model.module'

export type { AppointmentCreateViewModelDependencies } from './appointment-create-view-model.module'

// Factory del ViewModel — equivale al constructor de AppointmentCreateViewModel : ViewModel()
export const createAppointmentCreateViewModel = (dependencies: AppointmentCreateViewModelDependencies) => {
  // Como StateFlow<List<Patient>> — opciones del select de pacientes
  const patients = ref<Patient[]>([])

  // Como StateFlow<List<MedicalService>> — opciones del select de servicios
  const services = ref<MedicalService[]>([])

  // Como StateFlow<Boolean> — carga de opciones del formulario (pacientes y servicios)
  const loading = ref(false)

  // Como StateFlow<Boolean> — operación de creación de cita en curso
  const pending = ref(false)

  // Como StateFlow<String?> — mensaje de error, expuesto read-only a la UI
  const errorMessage = ref<string | null>(null)

  // Como StateFlow<ErrorKind?> — 'validation' (accionable) vs 'server' (tecnico),
  // permite a la UI distinguir "revisa esto" de "algo fallo, intenta de nuevo"
  const errorKind = ref<'validation' | 'server' | null>(null)

  // Como StateFlow<String?> — mensaje de éxito tras crear la cita
  const successMessage = ref<string | null>(null)

  // Como StateFlow<Appointment?> — cita recién creada, null hasta que el submit tiene éxito
  const createdAppointment = ref<Appointment | null>(null)

  // Como MutableStateFlow<AppointmentFormState> — estado mutable del formulario,
  // con valores por defecto (primer paciente/servicio disponible, hora de inicio a las 9am)
  const form = reactive(createInitialAppointmentForm())

  const syncDefaultSelections = () => {
    if (!form.patientId && patients.value[0]?.id) form.patientId = patients.value[0].id
    if (!form.serviceId && services.value[0]?.id) form.serviceId = services.value[0].id
  }

  // Equivale a fun loadFormOptions() — carga paralela de pacientes y servicios disponibles
  const loadFormOptions = async () => {
    loading.value = true
    errorMessage.value = null
    errorKind.value = null

    try {
      const [loadedPatients, loadedServices] = await Promise.all([
        dependencies.listAppointmentPatientsUseCase.execute(),
        dependencies.listAppointmentServicesUseCase.execute(),
      ])

      patients.value = loadedPatients
      services.value = loadedServices
      syncDefaultSelections()
    } catch (error) {
      const normalized = normalizeApiError(error, 'No se pudieron cargar los datos para registrar la cita.')
      errorMessage.value = normalized.message
      errorKind.value = normalized.kind
    } finally {
      loading.value = false
    }
  }

  // Equivale a fun onSubmitAppointment() — lanza el UseCase y actualiza los StateFlows
  const submitAppointment = async () => {
    pending.value = true
    errorMessage.value = null
    errorKind.value = null
    successMessage.value = null

    try {
      createdAppointment.value = await dependencies.createAppointmentUseCase.execute({
        patientId: form.patientId,
        serviceId: form.serviceId,
        startAt: form.startAt,
        isUrgent: form.isUrgent,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      })

      successMessage.value = 'Cita registrada correctamente.'
    } catch (error) {
      const normalized = normalizeApiError(error, 'No se pudo registrar la cita.')
      errorMessage.value = normalized.message
      errorKind.value = normalized.kind
    } finally {
      pending.value = false
    }
  }

  return {
    patients,
    services,
    form,
    loading,
    pending,
    errorMessage,
    errorKind,
    successMessage,
    createdAppointment,
    loadFormOptions,
    submitAppointment,
  }
}
