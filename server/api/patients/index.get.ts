import { ListPatientsUseCase } from '../../../src/application/use-cases/list-patients'
import { DrizzlePatientRepository } from '../../../src/infrastructure/repositories/drizzle-patient-repository'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event)
    const patientRepository = new DrizzlePatientRepository()
    const listPatientsUseCase = new ListPatientsUseCase(patientRepository)

    return await listPatientsUseCase.execute({
      organizationId: session.organizationId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
