import { z } from 'zod'

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    if (!value) {
      return null
    }

    return value
  })

export const assistantSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: optionalText,
  specialty: optionalText,
})

export type AssistantSchema = z.infer<typeof assistantSchema>
