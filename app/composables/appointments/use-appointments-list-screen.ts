import { onMounted } from 'vue'
import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import { createAppointmentsListScreen } from '~~/src/presentation/view-models/appointments/create-appointments-list-screen'

export const useAppointmentsListScreen = () => {
  const screen = createAppointmentsListScreen({
    listTodayAppointmentsUseCase: appointmentServiceLocator.listTodayAppointmentsUseCase,
    getAppointmentSessionContextUseCase: appointmentServiceLocator.getAppointmentSessionContextUseCase,
  })

  onMounted(() => {
    void Promise.all([screen.loadAppointments(), screen.loadSessionContext()])
  })

  return screen
}
