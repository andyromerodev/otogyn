import { preEvaluationFormSchema } from '../../../src/presentation/validators/pre-evaluation-form'
import { handleApiError } from '../../utils/handle-api-error'
import { getPublicContext } from '../../utils/get-public-context'
import { validatePublicHoneypot, validatePublicSecurityToken } from '../../utils/public-security'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const { organizationId } = await getPublicContext()
    const payload = await readBody(event)
    const input = preEvaluationFormSchema.parse(payload)
    validatePublicSecurityToken(input.publicSecurityToken, 'pre_evaluation')
    validatePublicHoneypot(input.website)

    return await serverServiceLocator.preEvaluationForms.createPreEvaluationFormUseCase.execute({
      organizationId,
      form: input,
    })
  } catch (error) {
    handleApiError(error)
  }
})
