import { onMounted } from 'vue'
import { consultationServiceLocator } from '~~/src/infrastructure/consultations/service-locator'
import { createConsultationWizardViewModel } from '~~/src/presentation/view-models/consultations/consultation-wizard-view-model'

export const useConsultationWizardViewModel = (appointmentId: string) => {
  const viewModel = createConsultationWizardViewModel({
    appointmentId,
    startConsultationUseCase: consultationServiceLocator.startConsultationUseCase,
    getConsultationByAppointmentUseCase: consultationServiceLocator.getConsultationByAppointmentUseCase,
    updateConsultationUseCase: consultationServiceLocator.updateConsultationUseCase,
    completeConsultationUseCase: consultationServiceLocator.completeConsultationUseCase,
    uploadConsultationAttachmentUseCase: consultationServiceLocator.uploadConsultationAttachmentUseCase,
  })

  onMounted(() => {
    void viewModel.load()
  })

  return viewModel
}
