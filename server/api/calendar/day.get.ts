import { z } from 'zod'
import { parseLocalDate } from '../../../src/application/utils/date/local-date'
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

    const date = parseLocalDate(query.date)

    return await serverServiceLocator.calendar.getCalendarDayUseCase.execute({
      organizationId: session.organizationId,
      date,
    })
  } catch (error) {
    handleApiError(error)
  }
})
