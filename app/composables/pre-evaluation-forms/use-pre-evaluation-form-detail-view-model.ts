import { patientServiceLocator } from '~~/src/infrastructure/patients/service-locator'
import { preEvaluationFormServiceLocator } from '~~/src/infrastructure/pre-evaluation-forms/service-locator'
import { createPreEvaluationFormDetailViewModel } from '~~/src/presentation/view-models/pre-evaluation-forms/pre-evaluation-form-detail-view-model'

export const usePreEvaluationFormDetailViewModel = async (formId: string) => {
  const viewModel = createPreEvaluationFormDetailViewModel({
    formId,
    getPreEvaluationFormDetailUseCase: preEvaluationFormServiceLocator.getPreEvaluationFormDetailUseCase,
    linkPreEvaluationFormToPatientUseCase: preEvaluationFormServiceLocator.linkPreEvaluationFormToPatientUseCase,
    createPatientFromPreEvaluationFormUseCase:
      preEvaluationFormServiceLocator.createPatientFromPreEvaluationFormUseCase,
    listPatientsUseCase: patientServiceLocator.listPatientsUseCase,
    getPatientDetailUseCase: patientServiceLocator.getPatientDetailUseCase,
  })

  await viewModel.loadForm()

  return viewModel
}
