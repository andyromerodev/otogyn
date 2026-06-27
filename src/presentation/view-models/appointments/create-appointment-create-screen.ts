import { reactive, ref } from 'vue'
import type { Appointment } from '../../../domain/entities/appointment'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type { AppointmentMutationInput } from '../../../application/dto/appointment-management'
import { type AppointmentScreenPort, createInitialAppointmentForm, normalizeApiError } from './appointment-screen.types'

export interface AppointmentCreateScreenDependencies {
  listAppointmentPatientsUseCase: { execute(): Promise<Patient[]> }
  listAppointmentServicesUseCase: { execute(): Promise<MedicalService[]> }
  createAppointmentUseCase: AppointmentScreenPort<AppointmentMutationInput, Appointment>
}

export const createAppointmentCreateScreen = (dependencies: AppointmentCreateScreenDependencies) => {
  const patients = ref<Patient[]>([])
  const services = ref<MedicalService[]>([])
  const loading = ref(false)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const createdAppointment = ref<Appointment | null>(null)
  const form = reactive(createInitialAppointmentForm())

  const syncDefaultSelections = () => {
    if (!form.patientId && patients.value[0]?.id) {
      form.patientId = patients.value[0].id
    }

    if (!form.serviceId && services.value[0]?.id) {
      form.serviceId = services.value[0].id
    }
  }

  const loadFormOptions = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const [loadedPatients, loadedServices] = await Promise.all([
        dependencies.listAppointmentPatientsUseCase.execute(),
        dependencies.listAppointmentServicesUseCase.execute(),
      ])

      patients.value = loadedPatients
      services.value = loadedServices
      syncDefaultSelections()
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudieron cargar los datos para registrar la cita.')
    } finally {
      loading.value = false
    }
  }

  const submitAppointment = async () => {
    pending.value = true
    errorMessage.value = null
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
      errorMessage.value = normalizeApiError(error, 'No se pudo registrar la cita.')
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
    successMessage,
    createdAppointment,
    loadFormOptions,
    submitAppointment,
  }
}
