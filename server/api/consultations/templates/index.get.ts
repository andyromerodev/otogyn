import { z } from 'zod'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

const querySchema = z.object({
  diagnosisCode: z.string().trim().max(50).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'consultations:read')
    const { diagnosisCode } = querySchema.parse(getQuery(event))

    return await serverServiceLocator.consultations.listTreatmentTemplatesUseCase.execute({
      organizationId: session.organizationId,
      diagnosisCode,
    })
  } catch (error) {
    handleApiError(error)
  }
})
