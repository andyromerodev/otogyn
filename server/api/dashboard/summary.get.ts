import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'
import { mockRuntime } from '../../utils/mock-runtime'

export default defineEventHandler(async () => {
  try {
    const session = await getCurrentUser()

    return await mockRuntime.useCases.getDashboardSummary.execute({
      organizationId: session.organizationId,
      day: new Date(),
    })
  } catch (error) {
    handleApiError(error)
  }
})
