import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    return await getCurrentUser(event)
  } catch (error) {
    handleApiError(error)
  }
})
