import { patientServiceLocator } from '~~/src/infrastructure/patients/service-locator'
import { createPatientCreateScreen } from '~~/src/presentation/view-models/patients/create-patient-create-screen'

export const usePatientCreateScreen = () =>
  createPatientCreateScreen({
    createPatientUseCase: patientServiceLocator.createPatientUseCase,
  })
