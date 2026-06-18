import { z } from 'zod'
import { handleApiError } from '../../utils/handle-api-error'
import { getPublicContext } from '../../utils/get-public-context'
import { serverServiceLocator } from '../../utils/server-service-locator'

const querySchema = z.object({
  serviceId: z.string().uuid('ID de servicio invalido.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invalido, usar YYYY-MM-DD.'),
})

export default defineEventHandler(async (event) => {
  try {
    const { organizationId } = await getPublicContext()
    const query = await getValidatedQuery(event, querySchema.parse)

    const [year, month, day] = query.date.split('-').map(Number)
    const date = new Date(year!, month! - 1, day!)
    date.setHours(0, 0, 0, 0)

    return await serverServiceLocator.booking.getPublicSlotsUseCase.execute({
      organizationId,
      date,
      serviceId: query.serviceId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
