import { z } from 'zod'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido, usar YYYY-MM-DD'),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'calendar:read')
    const query = await getValidatedQuery(event, querySchema.parse)

    const [year, month, day] = query.date.split('-').map(Number)
    const referenceDate = new Date(year!, month! - 1, day!)

    return await serverServiceLocator.calendar.getCalendarWeekUseCase.execute({
      organizationId: session.organizationId,
      referenceDate,
    })
  } catch (error) {
    handleApiError(error)
  }
})
