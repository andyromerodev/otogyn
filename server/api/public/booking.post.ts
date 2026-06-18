import { z } from 'zod'
import { handleApiError } from '../../utils/handle-api-error'
import { getPublicContext } from '../../utils/get-public-context'
import { serverServiceLocator } from '../../utils/server-service-locator'

const bookingSchema = z.object({
  serviceId: z.string().uuid('ID de servicio invalido.'),
  startAt: z.string().datetime('Fecha y hora invalida.'),
  patientName: z.string().min(2, 'Nombre demasiado corto.').max(180),
  patientPhone: z.string().min(6, 'Telefono demasiado corto.').max(40),
  patientEmail: z.string().email('Email invalido.').optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  try {
    const { organizationId, systemUserId } = await getPublicContext()
    const payload = await readBody(event)
    const input = bookingSchema.parse(payload)

    return await serverServiceLocator.booking.createPublicBookingUseCase.execute({
      organizationId,
      systemUserId,
      booking: input,
    })
  } catch (error) {
    handleApiError(error)
  }
})
