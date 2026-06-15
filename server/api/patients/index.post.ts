import { CreatePatientUseCase } from '../../../src/application/use-cases/create-patient'
import { DrizzlePatientRepository } from '../../../src/infrastructure/repositories/drizzle-patient-repository'
import { patientSchema } from '../../../src/presentation/validators/patient'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event, ['admin_doctor', 'assistant'])
    const payload = await readBody(event)
    const input = patientSchema.parse(payload)
    const patientRepository = new DrizzlePatientRepository()
    const createPatientUseCase = new CreatePatientUseCase(patientRepository)

    return await createPatientUseCase.execute({
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
