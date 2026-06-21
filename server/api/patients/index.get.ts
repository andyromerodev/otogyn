import { getQuery } from 'h3'
import { patientListQuerySchema } from '../../../src/presentation/validators/patient'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'patients:read')
    const query = patientListQuerySchema.parse(getQuery(event))

    return await serverServiceLocator.patients.listPatientsUseCase.execute({
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
