import { patientServiceLocator } from '~~/src/infrastructure/patients/service-locator'
import { createPatientsScreen } from '~~/src/presentation/view-models/patients/create-patients-screen'

export const usePatientsScreen = async () => {
  const screen = createPatientsScreen({
    listPatientsUseCase: patientServiceLocator.listPatientsUseCase,
    createPatientUseCase: patientServiceLocator.createPatientUseCase,
  })

  await screen.loadPatients()

  return screen
}
