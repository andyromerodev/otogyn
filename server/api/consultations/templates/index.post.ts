import { z } from 'zod'
import { requireAuthorizedUser } from '../../../utils/authorization'
import { handleApiError } from '../../../utils/handle-api-error'
import { serverServiceLocator } from '../../../utils/server-service-locator'

const medicationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  dose: z.string().trim().max(100).nullable().optional(),
  route: z.string().trim().max(100).nullable().optional(),
  frequency: z.string().trim().max(100).nullable().optional(),
  duration: z.string().trim().max(100).nullable().optional(),
  additionalInfo: z.string().trim().max(500).nullable().optional(),
  isUsualMedication: z.boolean().default(false),
})

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  diagnosisCode: z.string().trim().max(50).nullable().optional(),
  diagnosisLabel: z.string().trim().max(500).nullable().optional(),
  treatmentPlan: z.string().trim().max(5000).default(''),
  medications: z.array(medicationSchema).max(50).default([]),
  auxiliaryExams: z.array(z.string().trim().max(300)).max(30).default([]),
})

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'consultations:write')
    const body = bodySchema.parse(await readBody(event))

    return await serverServiceLocator.consultations.createTreatmentTemplateUseCase.execute({
      organizationId: session.organizationId,
      name: body.name,
      diagnosisCode: body.diagnosisCode ?? null,
      diagnosisLabel: body.diagnosisLabel ?? null,
      treatmentPlan: body.treatmentPlan,
      medications: body.medications,
      auxiliaryExams: body.auxiliaryExams,
    })
  } catch (error) {
    handleApiError(error)
  }
})
