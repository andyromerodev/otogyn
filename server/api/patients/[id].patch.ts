import { patientSchema } from '../../../src/presentation/validators/patient'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'patients:write')
    const patientId = getRouterParam(event, 'id')

    if (!patientId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Patient id is required.',
      })
    }

    const payload = await readBody(event)
    const input = patientSchema.parse(payload)

    return await serverServiceLocator.patients.updatePatientUseCase.execute({
      patientId,
      organizationId: session.organizationId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      birthDate: input.birthDate ?? null,
      documentId: input.documentId ?? null,
      administrativeNotes: input.administrativeNotes ?? null,
    })
  } catch (error) {
    handleApiError(error)
  }
})
