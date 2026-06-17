import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    return await requireAuthorizedUser(event, 'session:read')
  } catch (error) {
    handleApiError(error)
  }
})
