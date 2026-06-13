export const roles = ['admin_doctor', 'assistant', 'patient_future'] as const

export type Role = (typeof roles)[number]
