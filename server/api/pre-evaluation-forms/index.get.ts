import { getQuery } from 'h3'
import { preEvaluationFormListQuerySchema } from '../../../src/presentation/validators/pre-evaluation-form'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'pre_evaluation_forms:read')
    const query = preEvaluationFormListQuerySchema.parse(getQuery(event))

    return await serverServiceLocator.preEvaluationForms.listPreEvaluationFormsUseCase.execute({
      organizationId: session.organizationId,
      search: query.search,
      filter: query.filter,
      page: query.page,
      pageSize: query.pageSize,
    })
  } catch (error) {
    handleApiError(error)
  }
})
