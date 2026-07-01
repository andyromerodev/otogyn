import { preEvaluationFormServiceLocator } from '~~/src/infrastructure/pre-evaluation-forms/service-locator'
import { createPreEvaluacionScreen } from '~~/src/presentation/view-models/pre-evaluacion/pre-evaluacion-screen'

export const usePreEvaluacionScreen = () =>
  createPreEvaluacionScreen({
    submitPreEvaluationFormUseCase: preEvaluationFormServiceLocator.submitPreEvaluationFormUseCase,
    uploadAttachmentUseCase: preEvaluationFormServiceLocator.uploadAttachmentUseCase,
  })
