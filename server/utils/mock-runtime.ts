import { CreatePatientUseCase } from '../../src/application/use-cases/create-patient'
import { CreateServiceUseCase } from '../../src/application/use-cases/create-service'
import { GetDashboardSummaryUseCase } from '../../src/application/use-cases/get-dashboard-summary'
import { GetTodayAppointmentsUseCase } from '../../src/application/use-cases/get-today-appointments'
import { ListPatientsUseCase } from '../../src/application/use-cases/list-patients'
import { ListServicesUseCase } from '../../src/application/use-cases/list-services'
import {
  demoAppointments,
  demoAvailability,
  demoBlockedSlots,
  demoPatients,
  demoServices,
} from '../../src/infrastructure/mock/demo-data'
import { MockAppointmentRepository } from '../../src/infrastructure/mock/mock-appointment-repository'
import { MockAvailabilityRepository } from '../../src/infrastructure/mock/mock-availability-repository'
import { MockPatientRepository } from '../../src/infrastructure/mock/mock-patient-repository'
import { MockServiceRepository } from '../../src/infrastructure/mock/mock-service-repository'

const appointmentRepository = new MockAppointmentRepository([...demoAppointments])
const patientRepository = new MockPatientRepository([...demoPatients])
const serviceRepository = new MockServiceRepository([...demoServices])
const availabilityRepository = new MockAvailabilityRepository([...demoAvailability], [...demoBlockedSlots])

export const mockRuntime = {
  repositories: {
    appointmentRepository,
    patientRepository,
    serviceRepository,
    availabilityRepository,
  },
  useCases: {
    getDashboardSummary: new GetDashboardSummaryUseCase(appointmentRepository),
    getTodayAppointments: new GetTodayAppointmentsUseCase(
      appointmentRepository,
      patientRepository,
      serviceRepository,
    ),
    createPatient: new CreatePatientUseCase(patientRepository),
    createService: new CreateServiceUseCase(serviceRepository),
    listPatients: new ListPatientsUseCase(patientRepository),
    listServices: new ListServicesUseCase(serviceRepository),
  },
}
