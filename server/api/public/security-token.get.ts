import { z } from 'zod'
import { createPublicSecurityToken } from '../../utils/public-security'

const querySchema = z.object({
  action: z.enum(['booking', 'pre_evaluation', 'pre_evaluation_upload']),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse)

  return {
    token: createPublicSecurityToken(query.action),
  }
})
