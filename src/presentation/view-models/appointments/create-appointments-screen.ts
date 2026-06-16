import { reactive, ref } from 'vue'
import type { Appointment } from '../../../domain/entities/appointment'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type {
  AppointmentMutationInput,
} from '../../../application/dto/appointment-management'
import type { TodayAppointmentViewModel } from '../dashboard'

export interface AppointmentScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface AppointmentsScreenDependencies {
  listAppointmentPatientsUseCase: { execute(): Promise<Patient[]> }
  listAppointmentServicesUseCase: { execute(): Promise<MedicalService[]> }
  listTodayAppointmentsUseCase: { execute(): Promise<TodayAppointmentViewModel[]> }
  createAppointmentUseCase: AppointmentScreenPort<AppointmentMutationInput, Appointment>
}

const toDatetimeLocalValue = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 16)
}

const defaultStartAt = () => {
  const date = new Date()
  date.setHours(9, 0, 0, 0)
  return toDatetimeLocalValue(date)
}

const createInitialForm = () => ({
  patientId: '',
  serviceId: '',
  startAt: defaultStartAt(),
  isUrgent: false,
  reason: '',
  notes: '',
})

export const createAppointmentsScreen = (dependencies: AppointmentsScreenDependencies) => {
  const patients = ref<Patient[]>([])
  const services = ref<MedicalService[]>([])
  const appointments = ref<TodayAppointmentViewModel[]>([])
  const loading = ref(false)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const form = reactive(createInitialForm())

  const syncDefaultSelections = () => {
    if (!form.patientId && patients.value[0]?.id) {
      form.patientId = patients.value[0].id
    }

    if (!form.serviceId && services.value[0]?.id) {
      form.serviceId = services.value[0].id
    }
  }

  const loadScreenData = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const [loadedPatients, loadedServices, loadedAppointments] = await Promise.all([
        dependencies.listAppointmentPatientsUseCase.execute(),
        dependencies.listAppointmentServicesUseCase.execute(),
        dependencies.listTodayAppointmentsUseCase.execute(),
      ])

      patients.value = loadedPatients
      services.value = loadedServices
      appointments.value = loadedAppointments
      syncDefaultSelections()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudieron cargar los datos de citas.'
    } finally {
      loading.value = false
    }
  }

  const submitAppointment = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.createAppointmentUseCase.execute({
        patientId: form.patientId,
        serviceId: form.serviceId,
        startAt: form.startAt,
        isUrgent: form.isUrgent,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      })

      const nextPatientId = form.patientId
      const nextServiceId = form.serviceId

      Object.assign(form, createInitialForm())
      form.patientId = nextPatientId
      form.serviceId = nextServiceId

      successMessage.value = 'Cita registrada correctamente.'
      appointments.value = await dependencies.listTodayAppointmentsUseCase.execute()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo registrar la cita.'
    } finally {
      pending.value = false
    }
  }

  return {
    patients,
    services,
    appointments,
    form,
    loading,
    pending,
    errorMessage,
    successMessage,
    loadScreenData,
    submitAppointment,
  }
}
