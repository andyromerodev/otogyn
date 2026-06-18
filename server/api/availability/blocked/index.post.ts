import { blockedSlotMutationSchema } from '../../../../src/presentation/validators/availability'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'availability:write')
    const payload = await readBody(event)
    const input = blockedSlotMutationSchema.parse(payload)

    return await serverServiceLocator.availability.createBlockedSlotUseCase.execute({
      organizationId: session.organizationId,
      startsAt: new Date(input.startsAt),
      endsAt: new Date(input.endsAt),
      reason: input.reason ?? null,
    })
  } catch (error) {
    handleApiError(error)
  }
})
