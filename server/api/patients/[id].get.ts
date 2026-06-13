import { handleApiError } from '../../utils/handle-api-error'
import { getCurrentUser } from '../../utils/get-current-user'
import { mockRuntime } from '../../utils/mock-runtime'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event)
    const patientId = getRouterParam(event, 'id')
    const patients = await mockRuntime.useCases.listPatients.execute({
      organizationId: session.organizationId,
    })
    const patient = patients.find((item) => item.id === patientId)

    if (!patient) {
      throw createError({ statusCode: 404, statusMessage: 'Patient not found.' })
    }

    return patient
  } catch (error) {
    handleApiError(error)
  }
})
