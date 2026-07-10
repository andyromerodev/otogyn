import { blockedSlotBulkMutationSchema } from '../../../../src/presentation/validators/availability'
import { parseAppDateTime } from '../../../../src/application/utils/date/local-date'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'availability:write')
    const payload = await readBody(event)
    const input = blockedSlotBulkMutationSchema.parse(payload)

    const startMs = new Date(input.startDate).getTime()
    const endMs = new Date(input.endDate).getTime()

    if (startMs > endMs) {
      throw createError({ statusCode: 422, statusMessage: 'La fecha de inicio debe ser anterior o igual a la fecha de fin.' })
    }

    const dayMs = 24 * 60 * 60 * 1000
    const diffDays = Math.round((endMs - startMs) / dayMs)

    if (diffDays > 30) {
      throw createError({ statusCode: 422, statusMessage: 'El rango no puede superar 31 días.' })
    }

    const inputs = Array.from({ length: diffDays + 1 }, (_, i) => {
      const dateStr = new Date(startMs + i * dayMs).toISOString().slice(0, 10)
      return {
        organizationId: session.organizationId,
        startsAt: parseAppDateTime(`${dateStr}T${input.startTime}:00`),
        endsAt: parseAppDateTime(`${dateStr}T${input.endTime}:00`),
        reason: input.reason ?? null,
      }
    })

    return await serverServiceLocator.availability.createBulkBlockedSlotsUseCase.execute(inputs)
  } catch (error) {
    handleApiError(error)
  }
})
