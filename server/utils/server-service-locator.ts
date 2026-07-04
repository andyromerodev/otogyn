import { CancelAppointmentUseCase } from '../../src/application/use-cases/cancel-appointment'
import { GetCalendarDayUseCase } from '../../src/application/use-cases/calendar/get-calendar-day'
import { GetCalendarMonthUseCase } from '../../src/application/use-cases/calendar/get-calendar-month'
import { GetCalendarWeekUseCase } from '../../src/application/use-cases/calendar/get-calendar-week'
import { ChangeAppointmentStatusUseCase } from '../../src/application/use-cases/change-appointment-status'
import { CreateAvailabilityUseCase } from '../../src/application/use-cases/availability/create-availability'
import { CreateBlockedSlotUseCase } from '../../src/application/use-cases/availability/create-blocked-slot'
import { CreateAssistantUseCase } from '../../src/application/use-cases/create-assistant'
import { CreatePatientUseCase } from '../../src/application/use-cases/create-patient'
import { CreateServiceUseCase } from '../../src/application/use-cases/create-service'
import { DeactivateAssistantUseCase } from '../../src/application/use-cases/deactivate-assistant'
import { DeleteServiceUseCase } from '../../src/application/use-cases/delete-service'
import { DeleteAssistantUseCase } from '../../src/application/use-cases/delete-assistant'
import { DeleteBlockedSlotUseCase } from '../../src/application/use-cases/availability/delete-blocked-slot'
import { GetAppointmentAvailableSlotsUseCase } from '../../src/application/use-cases/get-appointment-available-slots'
import { GetAppointmentDetailUseCase } from '../../src/application/use-cases/get-appointment-detail'
import { GetDashboardSummaryUseCase } from '../../src/application/use-cases/get-dashboard-summary'
import { GetPatientDetailUseCase } from '../../src/application/use-cases/get-patient-detail'
import { GetServiceDetailUseCase } from '../../src/application/use-cases/get-service-detail'
import { GetTodayAppointmentsUseCase } from '../../src/application/use-cases/get-today-appointments'
import { ListAssistantsUseCase } from '../../src/application/use-cases/list-assistants'
import { ListAppointmentsUseCase } from '../../src/application/use-cases/list-appointments'
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
import { CreatePublicBookingUseCase } from '../../src/application/use-cases/booking/create-public-booking'
import { GetPublicServicesUseCase } from '../../src/application/use-cases/booking/get-public-services'
import { GetPublicSlotsUseCase } from '../../src/application/use-cases/booking/get-public-slots'
import { CreatePreEvaluationFormUseCase } from '../../src/application/use-cases/pre-evaluation-forms/create-pre-evaluation-form'
import { UploadPreEvaluationAttachmentUseCase } from '../../src/application/use-cases/pre-evaluation-forms/upload-pre-evaluation-attachment'
import { ListPreEvaluationFormsUseCase } from '../../src/application/use-cases/pre-evaluation-forms/list-pre-evaluation-forms'
import { GetPreEvaluationFormDetailUseCase } from '../../src/application/use-cases/pre-evaluation-forms/get-pre-evaluation-form-detail'
import { LinkPreEvaluationFormToPatientUseCase } from '../../src/application/use-cases/pre-evaluation-forms/link-pre-evaluation-form-to-patient'
import { CreatePatientFromPreEvaluationFormUseCase } from '../../src/application/use-cases/pre-evaluation-forms/create-patient-from-pre-evaluation-form'
import { StartConsultationUseCase } from '../../src/application/use-cases/consultations/start-consultation'
import { UpdateConsultationUseCase } from '../../src/application/use-cases/consultations/update-consultation'
import { CompleteConsultationUseCase } from '../../src/application/use-cases/consultations/complete-consultation'
import { GetConsultationByAppointmentUseCase } from '../../src/application/use-cases/consultations/get-consultation-by-appointment'
import { ListPatientConsultationsUseCase } from '../../src/application/use-cases/consultations/list-patient-consultations'
import { ListTreatmentTemplatesUseCase } from '../../src/application/use-cases/consultations/list-treatment-templates'
import { CreateTreatmentTemplateUseCase } from '../../src/application/use-cases/consultations/create-treatment-template'
import { DeleteTreatmentTemplateUseCase } from '../../src/application/use-cases/consultations/delete-treatment-template'
import { DrizzleTreatmentTemplateRepository } from '../../src/infrastructure/repositories/drizzle-treatment-template-repository'
import { DrizzleAppointmentRepository } from '../../src/infrastructure/repositories/drizzle-appointment-repository'
import { DrizzleAssistantRepository } from '../../src/infrastructure/repositories/drizzle-assistant-repository'
import { DrizzleAvailabilityRepository } from '../../src/infrastructure/repositories/drizzle-availability-repository'
import { DrizzlePatientRepository } from '../../src/infrastructure/repositories/drizzle-patient-repository'
import { DrizzlePreEvaluationFormRepository } from '../../src/infrastructure/repositories/drizzle-pre-evaluation-form-repository'
import { DrizzleServiceRepository } from '../../src/infrastructure/repositories/drizzle-service-repository'
import { DrizzleConsultationRepository } from '../../src/infrastructure/repositories/drizzle-consultation-repository'
import { NetlifyBlobsAttachmentStorage } from '../../src/infrastructure/storage/netlify-blobs-attachment-storage'
import { ResendNotificationService } from '../../src/infrastructure/notifications/resend-notification-service'

const patientRepository = new DrizzlePatientRepository()
const serviceRepository = new DrizzleServiceRepository()
const assistantRepository = new DrizzleAssistantRepository()
const appointmentRepository = new DrizzleAppointmentRepository()
const availabilityRepository = new DrizzleAvailabilityRepository()
const preEvaluationFormRepository = new DrizzlePreEvaluationFormRepository()
const consultationRepository = new DrizzleConsultationRepository()
const treatmentTemplateRepository = new DrizzleTreatmentTemplateRepository()
const attachmentStorage = new NetlifyBlobsAttachmentStorage()
const consultationAttachmentStorage = new NetlifyBlobsAttachmentStorage('consultation-attachments')
const notificationService = new ResendNotificationService()

const scheduleAppointmentUseCase = new ScheduleAppointmentUseCase(
  appointmentRepository,
  patientRepository,
  serviceRepository,
  availabilityRepository,
)
const changeAppointmentStatusUseCase = new ChangeAppointmentStatusUseCase(appointmentRepository)

export const serverServiceLocator = {
  repositories: {
    patientRepository,
    serviceRepository,
    assistantRepository,
    appointmentRepository,
    availabilityRepository,
    consultationRepository,
  },
  patients: {
    listPatientsUseCase: new ListPatientsUseCase(patientRepository),
    getPatientDetailUseCase: new GetPatientDetailUseCase(patientRepository),
    createPatientUseCase: new CreatePatientUseCase(patientRepository),
    updatePatientUseCase: new UpdatePatientUseCase(patientRepository),
  },
  services: {
    listServicesUseCase: new ListServicesUseCase(serviceRepository),
    getServiceDetailUseCase: new GetServiceDetailUseCase(serviceRepository),
    createServiceUseCase: new CreateServiceUseCase(serviceRepository),
    updateServiceUseCase: new UpdateServiceUseCase(serviceRepository),
    deleteServiceUseCase: new DeleteServiceUseCase(serviceRepository),
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
    listAppointmentsUseCase: new ListAppointmentsUseCase(appointmentRepository),
    getAppointmentDetailUseCase: new GetAppointmentDetailUseCase(
      appointmentRepository,
      patientRepository,
      serviceRepository,
    ),
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
    changeAppointmentStatusUseCase,
    getAppointmentAvailableSlotsUseCase: new GetAppointmentAvailableSlotsUseCase(
      appointmentRepository,
      availabilityRepository,
      serviceRepository,
    ),
  },
  dashboard: {
    getDashboardSummaryUseCase: new GetDashboardSummaryUseCase(appointmentRepository),
  },
  booking: {
    getPublicServicesUseCase: new GetPublicServicesUseCase(serviceRepository),
    getPublicSlotsUseCase: new GetPublicSlotsUseCase(
      appointmentRepository,
      availabilityRepository,
      serviceRepository,
    ),
    createPublicBookingUseCase: new CreatePublicBookingUseCase(
      patientRepository,
      serviceRepository,
      scheduleAppointmentUseCase,
    ),
  },
  preEvaluationForms: {
    createPreEvaluationFormUseCase: new CreatePreEvaluationFormUseCase(
      patientRepository,
      preEvaluationFormRepository,
      notificationService,
    ),
    uploadPreEvaluationAttachmentUseCase: new UploadPreEvaluationAttachmentUseCase(
      attachmentStorage,
    ),
    listPreEvaluationFormsUseCase: new ListPreEvaluationFormsUseCase(preEvaluationFormRepository),
    getPreEvaluationFormDetailUseCase: new GetPreEvaluationFormDetailUseCase(
      preEvaluationFormRepository,
    ),
    linkPreEvaluationFormToPatientUseCase: new LinkPreEvaluationFormToPatientUseCase(
      preEvaluationFormRepository,
      patientRepository,
    ),
    createPatientFromPreEvaluationFormUseCase: new CreatePatientFromPreEvaluationFormUseCase(
      preEvaluationFormRepository,
      patientRepository,
    ),
    attachmentStorage,
  },
  consultations: {
    startConsultationUseCase: new StartConsultationUseCase(
      consultationRepository,
      appointmentRepository,
    ),
    updateConsultationUseCase: new UpdateConsultationUseCase(consultationRepository),
    completeConsultationUseCase: new CompleteConsultationUseCase(
      consultationRepository,
      changeAppointmentStatusUseCase,
    ),
    getConsultationByAppointmentUseCase: new GetConsultationByAppointmentUseCase(
      consultationRepository,
    ),
    listPatientConsultationsUseCase: new ListPatientConsultationsUseCase(consultationRepository),
    listTreatmentTemplatesUseCase: new ListTreatmentTemplatesUseCase(treatmentTemplateRepository),
    createTreatmentTemplateUseCase: new CreateTreatmentTemplateUseCase(treatmentTemplateRepository),
    deleteTreatmentTemplateUseCase: new DeleteTreatmentTemplateUseCase(treatmentTemplateRepository),
    attachmentStorage: consultationAttachmentStorage,
  },
  calendar: {
    getCalendarMonthUseCase: new GetCalendarMonthUseCase(appointmentRepository),
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
