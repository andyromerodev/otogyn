import type {
  CreatePreEvaluationFormInput,
  CreatePreEvaluationFormResult,
} from '../../../application/dto/pre-evaluation-form'
import type { PreEvaluationFormRepository } from '../../../application/ports/pre-evaluation-form-repository'
import type { PreEvaluationFormRemoteDataSource } from '../remote/pre-evaluation-form-remote-data-source'

export class PreEvaluationFormRepositoryImpl implements PreEvaluationFormRepository {
  constructor(private readonly remoteDataSource: PreEvaluationFormRemoteDataSource) {}

  submit(input: CreatePreEvaluationFormInput): Promise<CreatePreEvaluationFormResult> {
    return this.remoteDataSource.submit(input)
  }

  uploadAttachment(file: File): Promise<{ key: string }> {
    return this.remoteDataSource.uploadAttachment(file)
  }
}
