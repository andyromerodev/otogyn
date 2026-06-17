import { UpdatePatientUseCase } from '../../../src/application/use-cases/update-patient'
import { DrizzlePatientRepository } from '../../../src/infrastructure/repositories/drizzle-patient-repository'
import { patientSchema } from '../../../src/presentation/validators/patient'
import { handleApiError } from '../../utils/handle-api-error'
import { requireStaffUser } from '../../utils/require-user'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireStaffUser(event)
    const patientId = getRouterParam(event, 'id')
    const payload = await readBody(event)
    const input = patientSchema.parse(payload)
    const patientRepository = new DrizzlePatientRepository()
    const updatePatientUseCase = new UpdatePatientUseCase(patientRepository)

    if (!patientId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Patient id is required.',
      })
    }

    return await updatePatientUseCase.execute({
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
