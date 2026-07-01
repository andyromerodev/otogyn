import { patientServiceLocator } from '~~/src/infrastructure/patients/service-locator'
import { createPatientDetailViewModel } from '~~/src/presentation/view-models/patients/patient-detail-view-model'

export const usePatientDetailViewModel = async (patientId: string) => {
  const viewModel = createPatientDetailViewModel({
    patientId,
    getPatientDetailUseCase: patientServiceLocator.getPatientDetailUseCase,
    updatePatientUseCase: patientServiceLocator.updatePatientUseCase,
  })

  await viewModel.loadPatient()

  return viewModel
}
