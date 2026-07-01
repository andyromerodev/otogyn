import type { CreatePreEvaluationFormInput, CreatePreEvaluationFormResult } from '../dto/pre-evaluation-form'

export interface PreEvaluationFormRepository {
  submit(input: CreatePreEvaluationFormInput): Promise<CreatePreEvaluationFormResult>
  uploadAttachment(file: File): Promise<{ key: string }>
}
