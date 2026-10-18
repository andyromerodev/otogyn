import { describe, expect, it } from 'vitest'
import { changePasswordSchema } from './change-password'

const validInput = {
  currentPassword: 'ContrasenaActual1',
  newPassword: 'ContrasenaNueva2',
  confirmPassword: 'ContrasenaNueva2',
}

describe('changePasswordSchema', () => {
  it('accepts a valid password change', () => {
    const result = changePasswordSchema.safeParse(validInput)

    expect(result.success).toBe(true)
  })

  it('rejects a new password shorter than 8 characters', () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      newPassword: 'corta12',
      confirmPassword: 'corta12',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['newPassword'],
          message: 'La contraseña nueva debe tener al menos 8 caracteres.',
        }),
      ]),
    )
  })

  it('rejects a confirmation that does not match the new password', () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      confirmPassword: 'OtraContrasena3',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['confirmPassword'],
          message: 'Las contraseñas nuevas no coinciden.',
        }),
      ]),
    )
  })

  it('rejects a new password equal to the current one', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'MismaContrasena1',
      newPassword: 'MismaContrasena1',
      confirmPassword: 'MismaContrasena1',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['newPassword'],
          message: 'La contraseña nueva debe ser distinta a la actual.',
        }),
      ]),
    )
  })
})
