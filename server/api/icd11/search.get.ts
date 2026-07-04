import { z } from 'zod'
import { searchIcd11 } from '../../utils/who-icd-client'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'

const querySchema = z.object({
  q: z.string().trim().min(2).max(100),
})

export default defineEventHandler(async (event) => {
  try {
    await requireAuthorizedUser(event, 'consultations:read')

    const { q } = querySchema.parse(getQuery(event))
    const { whoIcdClientId, whoIcdClientSecret } = useRuntimeConfig()

    return await searchIcd11(q, whoIcdClientId as string, whoIcdClientSecret as string)
  } catch (error) {
    handleApiError(error)
  }
})
