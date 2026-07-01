import type {
  CreatePreEvaluationFormInput,
  CreatePreEvaluationFormResult,
} from '../../../application/dto/pre-evaluation-form'

export interface PreEvaluationFormRemoteDataSource {
  submit(input: CreatePreEvaluationFormInput): Promise<CreatePreEvaluationFormResult>
  uploadAttachment(file: File): Promise<{ key: string }>
}
