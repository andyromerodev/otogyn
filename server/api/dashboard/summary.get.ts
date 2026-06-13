import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'
import { mockRuntime } from '../../utils/mock-runtime'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event)

    return await mockRuntime.useCases.getDashboardSummary.execute({
      organizationId: session.organizationId,
      day: new Date(),
    })
  } catch (error) {
    handleApiError(error)
  }
})
