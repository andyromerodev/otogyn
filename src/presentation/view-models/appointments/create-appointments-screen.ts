import { reactive, ref } from 'vue'
import type { Appointment } from '../../../domain/entities/appointment'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type { AppointmentStatus } from '../../../domain/value-objects/appointment-status'
import type {
  AppointmentMutationInput,
  AppointmentStatusMutationInput,
} from '../../../application/dto/appointment-management'
import type { TodayAppointmentViewModel } from '../dashboard'

export interface AppointmentScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface AppointmentsScreenDependencies {
  getAppointmentSessionContextUseCase: { execute(): Promise<{ role: 'admin_doctor' | 'assistant' }> }
  listAppointmentPatientsUseCase: { execute(): Promise<Patient[]> }
  listAppointmentServicesUseCase: { execute(): Promise<MedicalService[]> }
  listTodayAppointmentsUseCase: { execute(): Promise<TodayAppointmentViewModel[]> }
  createAppointmentUseCase: AppointmentScreenPort<AppointmentMutationInput, Appointment>
  updateAppointmentUseCase: { execute(appointmentId: string, input: AppointmentMutationInput): Promise<Appointment> }
  cancelAppointmentUseCase: { execute(appointmentId: string): Promise<Appointment> }
  changeAppointmentStatusUseCase: { execute(input: AppointmentStatusMutationInput): Promise<Appointment> }
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

const fromIsoToDatetimeLocalValue = (value: string) => {
  const date = new Date(value)
  return toDatetimeLocalValue(date)
}

const appointmentStatusesForUi: Array<{
  value: Exclude<AppointmentStatus, 'cancelled'>
  label: string
}> = [
  { value: 'scheduled', label: 'Programada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'checked_in', label: 'En sala' },
  { value: 'in_progress', label: 'En consulta' },
  { value: 'completed', label: 'Completada' },
  { value: 'no_show', label: 'No asistio' },
]

const createInitialForm = () => ({
  patientId: '',
  serviceId: '',
  startAt: defaultStartAt(),
  isUrgent: false,
  reason: '',
  notes: '',
})

export const createAppointmentsScreen = (dependencies: AppointmentsScreenDependencies) => {
  const sessionRole = ref<'admin_doctor' | 'assistant'>('assistant')
  const patients = ref<Patient[]>([])
  const services = ref<MedicalService[]>([])
  const appointments = ref<TodayAppointmentViewModel[]>([])
  const loading = ref(false)
  const pending = ref(false)
  const appointmentActionPendingId = ref<string | null>(null)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const editingAppointmentId = ref<string | null>(null)
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
      const [loadedSessionContext, loadedPatients, loadedServices, loadedAppointments] = await Promise.all([
        dependencies.getAppointmentSessionContextUseCase.execute(),
        dependencies.listAppointmentPatientsUseCase.execute(),
        dependencies.listAppointmentServicesUseCase.execute(),
        dependencies.listTodayAppointmentsUseCase.execute(),
      ])

      sessionRole.value = loadedSessionContext.role
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

  const resetForm = () => {
    const nextPatientId = form.patientId
    const nextServiceId = form.serviceId

    Object.assign(form, createInitialForm())
    form.patientId = nextPatientId
    form.serviceId = nextServiceId
    editingAppointmentId.value = null
  }

  const refreshAppointments = async () => {
    appointments.value = await dependencies.listTodayAppointmentsUseCase.execute()
  }

  const startEditingAppointment = (appointment: TodayAppointmentViewModel) => {
    editingAppointmentId.value = appointment.id
    form.patientId = appointment.patientId
    form.serviceId = appointment.serviceId
    form.startAt = fromIsoToDatetimeLocalValue(appointment.startAt)
    form.isUrgent = appointment.isUrgent
    form.reason = appointment.reason ?? ''
    form.notes = appointment.notes ?? ''
    successMessage.value = null
    errorMessage.value = null
  }

  const cancelEditingAppointment = () => {
    resetForm()
    syncDefaultSelections()
  }

  const canEditAppointment = (appointment: TodayAppointmentViewModel) =>
    appointment.status !== 'completed' || sessionRole.value === 'admin_doctor'

  const canCancelAppointment = (appointment: TodayAppointmentViewModel) =>
    appointment.status !== 'cancelled' &&
    (appointment.status !== 'completed' || sessionRole.value === 'admin_doctor')

  const canChangeAppointmentStatus = (appointment: TodayAppointmentViewModel) =>
    appointment.status !== 'cancelled' &&
    (appointment.status !== 'completed' || sessionRole.value === 'admin_doctor')

  const submitAppointment = async () => {
    pending.value = true
    errorMessage.value = null
    successMessage.value = null

    try {
      const input = {
        patientId: form.patientId,
        serviceId: form.serviceId,
        startAt: form.startAt,
        isUrgent: form.isUrgent,
        reason: form.reason.trim() || null,
        notes: form.notes.trim() || null,
      } satisfies AppointmentMutationInput

      if (editingAppointmentId.value) {
        await dependencies.updateAppointmentUseCase.execute(editingAppointmentId.value, input)
        successMessage.value = 'Cita actualizada correctamente.'
      } else {
        await dependencies.createAppointmentUseCase.execute(input)
        successMessage.value = 'Cita registrada correctamente.'
      }

      resetForm()
      await refreshAppointments()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo registrar la cita.'
    } finally {
      pending.value = false
    }
  }

  const submitAppointmentStatus = async (
    appointment: TodayAppointmentViewModel,
    status: Exclude<AppointmentStatus, 'cancelled'>,
  ) => {
    appointmentActionPendingId.value = appointment.id
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.changeAppointmentStatusUseCase.execute({
        appointmentId: appointment.id,
        status,
      })
      successMessage.value = 'Estado de la cita actualizado correctamente.'
      await refreshAppointments()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo actualizar el estado de la cita.'
    } finally {
      appointmentActionPendingId.value = null
    }
  }

  const submitAppointmentStatusSelection = async (
    appointment: TodayAppointmentViewModel,
    statusValue: string,
  ) => {
    const status = appointmentStatusesForUi.find((item) => item.value === statusValue)?.value

    if (!status) {
      errorMessage.value = 'Estado de cita invalido.'
      return
    }

    await submitAppointmentStatus(appointment, status)
  }

  const submitAppointmentCancellation = async (appointment: TodayAppointmentViewModel) => {
    appointmentActionPendingId.value = appointment.id
    errorMessage.value = null
    successMessage.value = null

    try {
      await dependencies.cancelAppointmentUseCase.execute(appointment.id)
      successMessage.value = 'Cita cancelada correctamente.'

      if (editingAppointmentId.value === appointment.id) {
        cancelEditingAppointment()
      }

      await refreshAppointments()
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cancelar la cita.'
    } finally {
      appointmentActionPendingId.value = null
    }
  }

  return {
    appointmentActionPendingId,
    appointmentStatusesForUi,
    patients,
    sessionRole,
    services,
    appointments,
    form,
    loading,
    pending,
    errorMessage,
    successMessage,
    editingAppointmentId,
    canCancelAppointment,
    canChangeAppointmentStatus,
    canEditAppointment,
    cancelEditingAppointment,
    loadScreenData,
    startEditingAppointment,
    submitAppointmentCancellation,
    submitAppointment,
    submitAppointmentStatus,
    submitAppointmentStatusSelection,
  }
}
