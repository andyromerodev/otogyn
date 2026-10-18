import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: 'Ingresa tu contraseña actual.' }),
    newPassword: z
      .string()
      .min(8, { error: 'La contraseña nueva debe tener al menos 8 caracteres.' })
      .max(128, { error: 'La contraseña nueva no puede tener más de 128 caracteres.' }),
    confirmPassword: z.string(),
  })
  .refine((input) => input.newPassword === input.confirmPassword, {
    error: 'Las contraseñas nuevas no coinciden.',
    path: ['confirmPassword'],
  })
  .refine((input) => input.newPassword !== input.currentPassword, {
    error: 'La contraseña nueva debe ser distinta a la actual.',
    path: ['newPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
