import { SubmitPreEvaluationFormFrontendUseCase } from '../../application/use-cases/pre-evaluation-forms/frontend/submit-pre-evaluation-form'
import { UploadPreEvaluationAttachmentFrontendUseCase } from '../../application/use-cases/pre-evaluation-forms/frontend/upload-pre-evaluation-attachment'
import { ListPreEvaluationFormsFrontendUseCase } from '../../application/use-cases/pre-evaluation-forms/frontend/list-pre-evaluation-forms'
import { GetPreEvaluationFormDetailFrontendUseCase } from '../../application/use-cases/pre-evaluation-forms/frontend/get-pre-evaluation-form-detail'
import { LinkPreEvaluationFormToPatientFrontendUseCase } from '../../application/use-cases/pre-evaluation-forms/frontend/link-pre-evaluation-form-to-patient'
import { CreatePatientFromPreEvaluationFormFrontendUseCase } from '../../application/use-cases/pre-evaluation-forms/frontend/create-patient-from-pre-evaluation-form'
import { HttpPreEvaluationFormRemoteDataSource } from './remote/http-pre-evaluation-form-remote-data-source'
import { PreEvaluationFormRepositoryImpl } from './repositories/pre-evaluation-form-repository-impl'
import { HttpPreEvaluationFormManagementRemoteDataSource } from './remote/http-pre-evaluation-form-management-remote-data-source'
import { PreEvaluationFormManagementRepositoryImpl } from './repositories/pre-evaluation-form-management-repository-impl'

const preEvaluationFormRemoteDataSource = new HttpPreEvaluationFormRemoteDataSource()
const preEvaluationFormRepository = new PreEvaluationFormRepositoryImpl(
  preEvaluationFormRemoteDataSource,
)

const preEvaluationFormManagementRemoteDataSource = new HttpPreEvaluationFormManagementRemoteDataSource()
const preEvaluationFormManagementRepository = new PreEvaluationFormManagementRepositoryImpl(
  preEvaluationFormManagementRemoteDataSource,
)

export const preEvaluationFormServiceLocator = {
  submitPreEvaluationFormUseCase: new SubmitPreEvaluationFormFrontendUseCase(
    preEvaluationFormRepository,
  ),
  uploadAttachmentUseCase: new UploadPreEvaluationAttachmentFrontendUseCase(
    preEvaluationFormRepository,
  ),
  listPreEvaluationFormsUseCase: new ListPreEvaluationFormsFrontendUseCase(
    preEvaluationFormManagementRepository,
  ),
  getPreEvaluationFormDetailUseCase: new GetPreEvaluationFormDetailFrontendUseCase(
    preEvaluationFormManagementRepository,
  ),
  linkPreEvaluationFormToPatientUseCase: new LinkPreEvaluationFormToPatientFrontendUseCase(
    preEvaluationFormManagementRepository,
  ),
  createPatientFromPreEvaluationFormUseCase: new CreatePatientFromPreEvaluationFormFrontendUseCase(
    preEvaluationFormManagementRepository,
  ),
}
