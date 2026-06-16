import { patientServiceLocator } from '~~/src/infrastructure/patients/service-locator'
import { createPatientDetailScreen } from '~~/src/presentation/view-models/patients/create-patient-detail-screen'

export const usePatientDetailScreen = async (patientId: string) => {
  const screen = createPatientDetailScreen({
    patientId,
    getPatientDetailUseCase: patientServiceLocator.getPatientDetailUseCase,
    updatePatientUseCase: patientServiceLocator.updatePatientUseCase,
  })

  await screen.loadPatient()

  return screen
}
