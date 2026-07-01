import { patientServiceLocator } from '~~/src/infrastructure/patients/service-locator'
import { createPatientCreateViewModel } from '~~/src/presentation/view-models/patients/patient-create-view-model'

export const usePatientCreateViewModel = () =>
  createPatientCreateViewModel({
    createPatientUseCase: patientServiceLocator.createPatientUseCase,
  })
