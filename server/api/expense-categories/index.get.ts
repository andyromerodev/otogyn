import { getQuery } from 'h3'
import { z } from 'zod'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

const querySchema = z.object({
  includeInactive: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'finances:read')
    const query = querySchema.parse(getQuery(event))

    return await serverServiceLocator.finances.listExpenseCategoriesUseCase.execute({
      organizationId: session.organizationId,
      includeInactive: query.includeInactive,
    })
  } catch (error) {
    handleApiError(error)
  }
})
