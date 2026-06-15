import { DrizzlePatientRepository } from '../../../src/infrastructure/repositories/drizzle-patient-repository'
import { handleApiError } from '../../utils/handle-api-error'
import { getCurrentUser } from '../../utils/get-current-user'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event)
    const patientId = getRouterParam(event, 'id')
    const patientRepository = new DrizzlePatientRepository()
    const patient = patientId ? await patientRepository.findById(patientId) : null

    if (!patient || patient.organizationId !== session.organizationId) {
      throw createError({ statusCode: 404, statusMessage: 'Patient not found.' })
    }

    return patient
  } catch (error) {
    handleApiError(error)
  }
})
