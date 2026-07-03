import { StartConsultationFrontendUseCase } from '../../application/use-cases/consultations/frontend/start-consultation'
import { GetConsultationByAppointmentFrontendUseCase } from '../../application/use-cases/consultations/frontend/get-consultation-by-appointment'
import { UpdateConsultationFrontendUseCase } from '../../application/use-cases/consultations/frontend/update-consultation'
import { CompleteConsultationFrontendUseCase } from '../../application/use-cases/consultations/frontend/complete-consultation'
import { ListConsultationsByPatientFrontendUseCase } from '../../application/use-cases/consultations/frontend/list-consultations-by-patient'
import { UploadConsultationAttachmentFrontendUseCase } from '../../application/use-cases/consultations/frontend/upload-consultation-attachment'
import { HttpConsultationRemoteDataSource } from './remote/http-consultation-remote-data-source'
import { ConsultationRepositoryImpl } from './repositories/consultation-repository-impl'

const consultationRemoteDataSource = new HttpConsultationRemoteDataSource()
const consultationRepository = new ConsultationRepositoryImpl(consultationRemoteDataSource)

export const consultationServiceLocator = {
  startConsultationUseCase: new StartConsultationFrontendUseCase(consultationRepository),
  getConsultationByAppointmentUseCase: new GetConsultationByAppointmentFrontendUseCase(consultationRepository),
  updateConsultationUseCase: new UpdateConsultationFrontendUseCase(consultationRepository),
  completeConsultationUseCase: new CompleteConsultationFrontendUseCase(consultationRepository),
  listConsultationsByPatientUseCase: new ListConsultationsByPatientFrontendUseCase(consultationRepository),
  uploadConsultationAttachmentUseCase: new UploadConsultationAttachmentFrontendUseCase(consultationRepository),
}
