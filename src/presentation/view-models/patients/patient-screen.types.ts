export interface PatientScreenPort<TInput, TResult> {
  execute(input: TInput): Promise<TResult>
}

export interface PatientFormState {
  fullName: string
  phone: string
  email: string
  birthDate: string
  documentId: string
  administrativeNotes: string
  isUrgent: boolean
}

export const createInitialPatientForm = (): PatientFormState => ({
  fullName: '',
  phone: '',
  email: '',
  birthDate: '',
  documentId: '',
  administrativeNotes: '',
  isUrgent: false,
})
