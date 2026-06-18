import { CancelAppointmentUseCase } from '../../src/application/use-cases/cancel-appointment'
import { GetCalendarDayUseCase } from '../../src/application/use-cases/calendar/get-calendar-day'
import { GetCalendarWeekUseCase } from '../../src/application/use-cases/calendar/get-calendar-week'
import { ChangeAppointmentStatusUseCase } from '../../src/application/use-cases/change-appointment-status'
import { CreateAvailabilityUseCase } from '../../src/application/use-cases/availability/create-availability'
import { CreateBlockedSlotUseCase } from '../../src/application/use-cases/availability/create-blocked-slot'
import { CreateAssistantUseCase } from '../../src/application/use-cases/create-assistant'
import { CreatePatientUseCase } from '../../src/application/use-cases/create-patient'
import { CreateServiceUseCase } from '../../src/application/use-cases/create-service'
import { DeactivateAssistantUseCase } from '../../src/application/use-cases/deactivate-assistant'
import { DeleteAssistantUseCase } from '../../src/application/use-cases/delete-assistant'
import { DeleteBlockedSlotUseCase } from '../../src/application/use-cases/availability/delete-blocked-slot'
import { GetDashboardSummaryUseCase } from '../../src/application/use-cases/get-dashboard-summary'
import { GetPatientDetailUseCase } from '../../src/application/use-cases/get-patient-detail'
import { GetTodayAppointmentsUseCase } from '../../src/application/use-cases/get-today-appointments'
import { ListAssistantsUseCase } from '../../src/application/use-cases/list-assistants'
import { ListAvailabilityUseCase } from '../../src/application/use-cases/availability/list-availability'
import { ListBlockedSlotsUseCase } from '../../src/application/use-cases/availability/list-blocked-slots'
import { ListPatientsUseCase } from '../../src/application/use-cases/list-patients'
import { ListServicesUseCase } from '../../src/application/use-cases/list-services'
import { ReactivateAssistantUseCase } from '../../src/application/use-cases/reactivate-assistant'
import { ScheduleAppointmentUseCase } from '../../src/application/use-cases/schedule-appointment'
import { ToggleAvailabilityActiveUseCase } from '../../src/application/use-cases/availability/toggle-availability-active'
import { UpdateAppointmentUseCase } from '../../src/application/use-cases/update-appointment'
import { UpdateAvailabilityUseCase } from '../../src/application/use-cases/availability/update-availability'
import { UpdateAssistantUseCase } from '../../src/application/use-cases/update-assistant'
import { UpdatePatientUseCase } from '../../src/application/use-cases/update-patient'
import { UpdateServiceUseCase } from '../../src/application/use-cases/update-service'
import { DrizzleAppointmentRepository } from '../../src/infrastructure/repositories/drizzle-appointment-repository'
import { DrizzleAssistantRepository } from '../../src/infrastructure/repositories/drizzle-assistant-repository'
import { DrizzleAvailabilityRepository } from '../../src/infrastructure/repositories/drizzle-availability-repository'
import { DrizzlePatientRepository } from '../../src/infrastructure/repositories/drizzle-patient-repository'
import { DrizzleServiceRepository } from '../../src/infrastructure/repositories/drizzle-service-repository'

const patientRepository = new DrizzlePatientRepository()
const serviceRepository = new DrizzleServiceRepository()
const assistantRepository = new DrizzleAssistantRepository()
const appointmentRepository = new DrizzleAppointmentRepository()
const availabilityRepository = new DrizzleAvailabilityRepository()

const scheduleAppointmentUseCase = new ScheduleAppointmentUseCase(
  appointmentRepository,
  patientRepository,
  serviceRepository,
  availabilityRepository,
)

export const serverServiceLocator = {
  repositories: {
    patientRepository,
    serviceRepository,
    assistantRepository,
    appointmentRepository,
    availabilityRepository,
  },
  patients: {
    listPatientsUseCase: new ListPatientsUseCase(patientRepository),
    getPatientDetailUseCase: new GetPatientDetailUseCase(patientRepository),
    createPatientUseCase: new CreatePatientUseCase(patientRepository),
    updatePatientUseCase: new UpdatePatientUseCase(patientRepository),
  },
  services: {
    listServicesUseCase: new ListServicesUseCase(serviceRepository),
    createServiceUseCase: new CreateServiceUseCase(serviceRepository),
    updateServiceUseCase: new UpdateServiceUseCase(serviceRepository),
  },
  availability: {
    listAvailabilityUseCase: new ListAvailabilityUseCase(availabilityRepository),
    listBlockedSlotsUseCase: new ListBlockedSlotsUseCase(availabilityRepository),
    createAvailabilityUseCase: new CreateAvailabilityUseCase(availabilityRepository),
    updateAvailabilityUseCase: new UpdateAvailabilityUseCase(availabilityRepository),
    toggleAvailabilityActiveUseCase: new ToggleAvailabilityActiveUseCase(availabilityRepository),
    createBlockedSlotUseCase: new CreateBlockedSlotUseCase(availabilityRepository),
    deleteBlockedSlotUseCase: new DeleteBlockedSlotUseCase(availabilityRepository),
  },
  assistants: {
    listAssistantsUseCase: new ListAssistantsUseCase(assistantRepository),
    createAssistantUseCase: new CreateAssistantUseCase(assistantRepository),
    updateAssistantUseCase: new UpdateAssistantUseCase(assistantRepository),
    deactivateAssistantUseCase: new DeactivateAssistantUseCase(assistantRepository),
    reactivateAssistantUseCase: new ReactivateAssistantUseCase(assistantRepository),
    deleteAssistantUseCase: new DeleteAssistantUseCase(assistantRepository),
  },
  appointments: {
    scheduleAppointmentUseCase,
    getTodayAppointmentsUseCase: new GetTodayAppointmentsUseCase(
      appointmentRepository,
      patientRepository,
      serviceRepository,
    ),
    updateAppointmentUseCase: new UpdateAppointmentUseCase(
      appointmentRepository,
      serviceRepository,
      scheduleAppointmentUseCase,
    ),
    cancelAppointmentUseCase: new CancelAppointmentUseCase(appointmentRepository),
    changeAppointmentStatusUseCase: new ChangeAppointmentStatusUseCase(appointmentRepository),
  },
  dashboard: {
    getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(appointmentRepository),
  },
  calendar: {
    getCalendarDayUseCase: new GetCalendarDayUseCase(
      appointmentRepository,
      availabilityRepository,
      patientRepository,
      serviceRepository,
    ),
    getCalendarWeekUseCase: new GetCalendarWeekUseCase(
      appointmentRepository,
      availabilityRepository,
      patientRepository,
      serviceRepository,
    ),
  },
}
